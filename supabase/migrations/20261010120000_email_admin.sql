-- Email log, contact form, admin audit trail and the admin overview function.
-- Apply after 20261008120000_referrals_credits.sql. Safe to run more than once.
-- Every table here has RLS on and NO client policies: only the service role (server code) can read or write them.

-- ---------------------------------------------------------------------------
-- email_log: one row per email sent to a user. Stops duplicates (welcome, credit earned) and throttles sign-in alerts.
-- ---------------------------------------------------------------------------
create table if not exists public.email_log (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.users (id) on delete cascade,
  kind text not null,
  created_at timestamptz not null default now()
);

create index if not exists email_log_user_kind_idx on public.email_log (user_id, kind, created_at desc);

-- One-time kinds (welcome, credit:<id>) can only exist once per user. Sign-in alerts repeat, so they are exempt.
create unique index if not exists email_log_once
  on public.email_log (user_id, kind)
  where kind not like 'signin%';

alter table public.email_log enable row level security;

-- ---------------------------------------------------------------------------
-- contact_messages: the public contact form.
-- ---------------------------------------------------------------------------
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  user_id uuid references public.users (id) on delete set null,
  ip_hash text,
  status text not null default 'new',
  created_at timestamptz not null default now(),
  constraint contact_messages_status check (status in ('new', 'handled')),
  constraint contact_messages_len check (char_length(name) <= 120 and char_length(email) <= 254 and char_length(message) between 5 and 4000)
);

create index if not exists contact_messages_ip_idx on public.contact_messages (ip_hash, created_at desc);
create index if not exists contact_messages_status_idx on public.contact_messages (status, created_at desc);

alter table public.contact_messages enable row level security;

-- ---------------------------------------------------------------------------
-- admin_audit: every change an admin makes. Append only (no update or delete from the app).
-- ---------------------------------------------------------------------------
create table if not exists public.admin_audit (
  id bigint generated always as identity primary key,
  admin_id uuid not null,
  action text not null,
  target_user uuid,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists admin_audit_created_idx on public.admin_audit (created_at desc);

alter table public.admin_audit enable row level security;

-- ---------------------------------------------------------------------------
-- admin_overview: all dashboard numbers in one call. Service role only.
-- ---------------------------------------------------------------------------
create or replace function public.admin_overview(p_days integer default 30)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  days integer := greatest(7, least(coalesce(p_days, 30), 180));
  result jsonb;
begin
  select jsonb_build_object(
    'totals', jsonb_build_object(
      'users', (select count(*) from public.users),
      'users_7d', (select count(*) from public.users where created_at > now() - interval '7 days'),
      'users_30d', (select count(*) from public.users where created_at > now() - interval '30 days'),
      'paid', (select count(*) from public.users where plan <> 'free' and (plan_expires_at is null or plan_expires_at > now())),
      'starter', (select count(*) from public.users where plan = 'starter' and (plan_expires_at is null or plan_expires_at > now())),
      'pro', (select count(*) from public.users where plan = 'pro' and (plan_expires_at is null or plan_expires_at > now())),
      'portfolios', (select count(*) from public.published_portfolios),
      'publishers', (select count(distinct user_id) from public.published_portfolios where user_id is not null),
      'credits_outstanding', (select coalesce(sum(delta), 0) from public.credit_ledger),
      'messages_new', (select count(*) from public.contact_messages where status = 'new'),
      'active_subscriptions', (select count(*) from public.subscriptions where status in ('active', 'trialing'))
    ),
    'referrals', (
      select coalesce(jsonb_object_agg(status, n), '{}'::jsonb)
      from (select status, count(*) as n from public.referrals group by status) r
    ),
    'usage_by_kind', (
      select coalesce(jsonb_object_agg(kind, n), '{}'::jsonb)
      from (
        select kind, count(*) as n from public.usage_events
        where created_at > now() - make_interval(days => days) group by kind
      ) u
    ),
    'daily', (
      select coalesce(jsonb_agg(row_to_json(d) order by d.day), '[]'::jsonb)
      from (
        select
          g.day::date as day,
          (select count(*) from public.users u where u.created_at::date = g.day::date) as signups,
          (select count(*) from public.published_portfolios p where p.created_at::date = g.day::date) as publishes,
          (select count(*) from public.usage_events e where e.kind = 'parse' and e.created_at::date = g.day::date) as builds
        from generate_series((now() - make_interval(days => days - 1))::date, now()::date, interval '1 day') as g(day)
      ) d
    )
  ) into result;
  return result;
end;
$$;

revoke all on function public.admin_overview(integer) from public, anon, authenticated;
