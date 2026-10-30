-- Razorpay billing, portfolio view counts, and email preferences.
--
-- Billing model: every purchase is a one-time Razorpay payment. Starter is owned for good; Pro is a pass of
-- 30 or 365 days that stacks on any Pro time left. One `subscriptions` row per captured payment (the unique
-- (provider, provider_subscription_id) key makes the grant idempotent across the checkout callback and the
-- webhook). Grant and revoke run in one transaction here, never in app code.

-- ---------------------------------------------------------------------------
-- Billing
-- ---------------------------------------------------------------------------
alter table public.users add column if not exists owns_starter boolean not null default false;
update public.users set owns_starter = true
  where starter_unlocked_via_credits or (plan = 'starter' and plan_expires_at is null);

alter table public.subscriptions
  add column if not exists product text,
  add column if not exists order_id text,
  add column if not exists amount integer,
  add column if not exists currency text,
  add column if not exists days integer;

-- Returns true when this payment was granted now, false when it had been granted before.
create or replace function public.grant_purchase(
  p_user uuid, p_payment_id text, p_order_id text, p_product text, p_amount integer, p_currency text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_days integer := case p_product when 'pro_month' then 30 when 'pro_year' then 365 else null end;
  v_plan text := case when p_product = 'starter' then 'starter' else 'pro' end;
  v_end timestamptz;
  u record;
begin
  if p_product not in ('starter', 'pro_month', 'pro_year') then raise exception 'unknown product %', p_product; end if;

  insert into public.subscriptions (user_id, provider, provider_subscription_id, order_id, plan, product, status, amount, currency, days)
  values (p_user, 'razorpay', p_payment_id, p_order_id, v_plan, p_product, 'active', p_amount, p_currency, v_days)
  on conflict (provider, provider_subscription_id) do nothing;
  if not found then return false; end if;

  select plan, plan_expires_at, owns_starter into u from public.users where id = p_user for update;
  if not found then raise exception 'no user %', p_user; end if;

  if p_product = 'starter' then
    update public.users
      set owns_starter = true,
          plan = case when u.plan = 'pro' and (u.plan_expires_at is null or u.plan_expires_at > now()) then u.plan else 'starter' end,
          plan_expires_at = case when u.plan = 'pro' and (u.plan_expires_at is null or u.plan_expires_at > now()) then u.plan_expires_at else null end
      where id = p_user;
  else
    v_end := greatest(now(), case when u.plan = 'pro' then coalesce(u.plan_expires_at, now()) else now() end) + make_interval(days => v_days);
    update public.users
      set plan = 'pro', plan_expires_at = v_end,
          owns_starter = u.owns_starter or (u.plan = 'starter' and u.plan_expires_at is null)
      where id = p_user;
    update public.subscriptions set current_period_end = v_end
      where provider = 'razorpay' and provider_subscription_id = p_payment_id;
  end if;
  return true;
end;
$$;

-- Full refund or lost dispute: take back what that payment bought. Returns the user id, or null if unknown.
create or replace function public.revoke_purchase(p_payment_id text, p_status text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  s record;
  u record;
  v_end timestamptz;
begin
  update public.subscriptions set status = p_status
    where provider = 'razorpay' and provider_subscription_id = p_payment_id and status = 'active'
    returning user_id, product, days into s;
  if not found then return null; end if;

  select plan, plan_expires_at, owns_starter into u from public.users where id = s.user_id for update;

  if s.product = 'starter' then
    update public.users
      set owns_starter = starter_unlocked_via_credits,
          plan = case when plan = 'starter' and not starter_unlocked_via_credits then 'free' else plan end
      where id = s.user_id;
  elsif u.plan = 'pro' and u.plan_expires_at is not null then
    v_end := u.plan_expires_at - make_interval(days => s.days);
    if v_end > now() then
      update public.users set plan_expires_at = v_end where id = s.user_id;
    else
      update public.users
        set plan = case when owns_starter then 'starter' else 'free' end, plan_expires_at = null
        where id = s.user_id;
    end if;
  end if;
  return s.user_id;
end;
$$;

revoke all on function public.grant_purchase(uuid, text, text, text, integer, text) from public, anon, authenticated;
revoke all on function public.revoke_purchase(text, text) from public, anon, authenticated;

-- spend_credits again, now aware of owns_starter: anyone who owns Starter (bought, unlocked, or kept after
-- Pro ran out) already has unlimited shuffles and Starter, so credits are never taken for either.
create or replace function public.spend_credits(p_user uuid, p_item text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  cost integer;
  ledger_reason text;
  bal integer;
  cur_plan text;
  cur_expires timestamptz;
  cur_owns_starter boolean;
begin
  if p_item = 'shuffle_pack' then
    cost := 1;
    ledger_reason := 'spend_shuffle_pack';
  elsif p_item = 'starter_unlock' then
    cost := 3;
    ledger_reason := 'spend_starter_unlock';
  else
    return jsonb_build_object('ok', false, 'error', 'invalid_item');
  end if;

  perform pg_advisory_xact_lock(hashtext('dx_credits:' || p_user::text));

  select plan, plan_expires_at, owns_starter into cur_plan, cur_expires, cur_owns_starter
  from public.users where id = p_user for update;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'no_user');
  end if;

  if cur_owns_starter or (cur_plan <> 'free' and (cur_expires is null or cur_expires > now())) then
    return jsonb_build_object('ok', false, 'error', 'already_included');
  end if;

  select coalesce(sum(delta), 0)::integer into bal from public.credit_ledger where user_id = p_user;
  if bal < cost then
    return jsonb_build_object('ok', false, 'error', 'insufficient_credits', 'balance', bal);
  end if;

  insert into public.credit_ledger (user_id, delta, reason) values (p_user, -cost, ledger_reason);

  if p_item = 'starter_unlock' then
    update public.users
      set plan = 'starter', plan_expires_at = null, starter_unlocked_via_credits = true, owns_starter = true
      where id = p_user;
  end if;

  return jsonb_build_object('ok', true, 'balance', bal - cost);
end;
$$;

revoke all on function public.spend_credits(uuid, text) from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Portfolio views: one row per portfolio per day. The public page bumps it; owners read their own.
-- ---------------------------------------------------------------------------
create table if not exists public.portfolio_views (
  slug text not null,
  day date not null default current_date,
  views integer not null default 0,
  primary key (slug, day)
);
alter table public.portfolio_views enable row level security;

drop policy if exists "portfolio_views_select_own" on public.portfolio_views;
create policy "portfolio_views_select_own" on public.portfolio_views for select
  using (exists (select 1 from public.published_portfolios p where p.slug = portfolio_views.slug and p.user_id = auth.uid()));

create or replace function public.bump_portfolio_view(p_slug text)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.portfolio_views (slug, day, views) values (p_slug, current_date, 1)
  on conflict (slug, day) do update set views = portfolio_views.views + 1;
$$;
revoke all on function public.bump_portfolio_view(text) from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Email preferences. Product emails (activation, share tips, renewal) are on by default and can be turned off;
-- offers are off until the person ticks the box. `email_token` signs one-click unsubscribe links.
-- ---------------------------------------------------------------------------
alter table public.users
  add column if not exists email_product boolean not null default true,
  add column if not exists email_offers boolean not null default false,
  add column if not exists email_token uuid not null default gen_random_uuid();
grant update (email_product, email_offers) on public.users to authenticated;

-- ---------------------------------------------------------------------------
-- Lifecycle emails: who should get which email today. At most one per person per run, none to test
-- accounts or people who turned product email off, and no product email within 3 days of the last one.
-- Renewal notices ignore that gap (they are about money). Kinds already in email_log are skipped.
-- ---------------------------------------------------------------------------
create or replace function public.lifecycle_candidates(p_limit integer default 200)
returns table (user_id uuid, email text, name text, kind text, views integer, plan_expires_at timestamptz)
language sql
security definer
set search_path = public
as $$
  with base as (
    select u.id, u.email, split_part(coalesce(u.full_name, ''), ' ', 1) as name, u.created_at, u.plan, u.plan_expires_at,
           au.last_sign_in_at,
           exists (select 1 from resumes r where r.user_id = u.id) as has_resume,
           exists (select 1 from published_portfolios p where p.user_id = u.id) as has_site,
           (select min(p.created_at) from published_portfolios p where p.user_id = u.id) as first_site,
           exists (select 1 from email_log l where l.user_id = u.id and l.created_at > now() - interval '3 days'
                   and (l.kind like 'life:%' or l.kind like 'views:%')) as recently_mailed
    from users u join auth.users au on au.id = u.id
    where not u.is_test and u.email is not null
  ),
  views7 as (
    select p.user_id, sum(v.views)::int as n
    from portfolio_views v join published_portfolios p on p.slug = v.slug
    where v.day > current_date - 7 group by p.user_id
  ),
  c as (
    -- Money first: Pro ending within 5 days, or ended in the last 3.
    select b.id, 1 as prio, 'renew:' || to_char(b.plan_expires_at, 'YYYY-MM-DD') as kind, null::int as views from base b
      where b.plan = 'pro' and b.plan_expires_at between now() and now() + interval '5 days'
    union all
    select b.id, 1, 'expired:' || to_char(b.plan_expires_at, 'YYYY-MM-DD'), null from base b
      where b.plan = 'pro' and b.plan_expires_at between now() - interval '3 days' and now()
    union all
    select b.id, 2, 'life:activate', null from base b join users u on u.id = b.id
      where u.email_product and not b.recently_mailed and not b.has_resume and not b.has_site
        and b.created_at between now() - interval '4 days' and now() - interval '1 day'
    union all
    select b.id, 3, 'life:resume_to_site', null from base b join users u on u.id = b.id
      where u.email_product and not b.recently_mailed and b.has_resume and not b.has_site
        and b.created_at between now() - interval '14 days' and now() - interval '3 days'
    union all
    select b.id, 4, 'life:invite', null from base b join users u on u.id = b.id
      where u.email_product and not b.recently_mailed and b.first_site between now() - interval '14 days' and now() - interval '7 days'
    union all
    select b.id, 5, 'views:' || to_char(now(), 'IYYY-IW'), v.n from base b join users u on u.id = b.id join views7 v on v.user_id = b.id
      where u.email_product and not b.recently_mailed and v.n >= 3 and extract(isodow from now()) = 1
    union all
    select b.id, 6, 'life:winback', null from base b join users u on u.id = b.id
      where u.email_product and not b.recently_mailed and b.last_sign_in_at < now() - interval '30 days'
  )
  select distinct on (c.id) c.id, b.email, nullif(b.name, ''), c.kind, c.views, b.plan_expires_at
  from c join base b on b.id = c.id
  where not exists (select 1 from email_log l where l.user_id = c.id and l.kind = c.kind)
  order by c.id, c.prio
  limit greatest(1, least(p_limit, 1000));
$$;
revoke all on function public.lifecycle_candidates(integer) from public, anon, authenticated;
