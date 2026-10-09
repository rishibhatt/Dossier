-- Referrals, credits and cancellation feedback.
-- Apply after 20261007120000_phase0_foundation.sql. Safe to run more than once.
--
-- Everything in this file that grants value (credits, plan changes) is written ONLY by the service role,
-- either directly or through the security-definer functions at the bottom, which are not callable by
-- anon/authenticated. Clients can read their own rows and nothing else.

-- ---------------------------------------------------------------------------
-- users: signup fingerprint + how Starter was obtained
-- ---------------------------------------------------------------------------
alter table public.users
  add column if not exists starter_unlocked_via_credits boolean not null default false,
  add column if not exists signup_ip_hash text;

-- Column grants from phase 0 still apply: authenticated users may update only
-- (full_name, avatar_url, username). The new columns are service-role only.

-- ---------------------------------------------------------------------------
-- referral_codes: one share code per user
-- ---------------------------------------------------------------------------
create table if not exists public.referral_codes (
  user_id uuid primary key references public.users (id) on delete cascade,
  code text not null unique,
  created_at timestamptz not null default now(),
  constraint referral_codes_format check (code ~ '^[a-z2-9]{8}$')
);

alter table public.referral_codes enable row level security;

drop policy if exists "referral_codes_select_own" on public.referral_codes;
create policy "referral_codes_select_own"
  on public.referral_codes for select
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- referrals: one row per referred account (referee_id is unique)
-- status: signed_up -> qualified (first publish) | rejected (anti-abuse rule, see reject_reason)
-- ---------------------------------------------------------------------------
create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references public.users (id) on delete cascade,
  referee_id uuid not null unique references public.users (id) on delete cascade,
  code text not null,
  status text not null default 'signed_up',
  reject_reason text,
  clicked_at timestamptz,
  referee_ip_hash text,
  created_at timestamptz not null default now(),
  qualified_at timestamptz,
  constraint referrals_status_check check (status in ('signed_up', 'qualified', 'rejected')),
  constraint referrals_not_self check (referrer_id <> referee_id)
);

create index if not exists referrals_referrer_idx on public.referrals (referrer_id, status, qualified_at desc);

alter table public.referrals enable row level security;

-- Referrers see the rows they earned from; referees see their own row. Neither side sees the other's email:
-- the table holds only ids, and public.users is still select-own.
drop policy if exists "referrals_select_own" on public.referrals;
create policy "referrals_select_own"
  on public.referrals for select
  using (auth.uid() = referrer_id or auth.uid() = referee_id);

-- ---------------------------------------------------------------------------
-- credit_ledger: append-only. Balance = sum(delta).
-- ---------------------------------------------------------------------------
create table if not exists public.credit_ledger (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.users (id) on delete cascade,
  delta integer not null,
  reason text not null,
  referral_id uuid references public.referrals (id) on delete set null,
  created_at timestamptz not null default now(),
  constraint credit_ledger_delta_nonzero check (delta <> 0),
  constraint credit_ledger_reason_check check (
    reason in ('referral_referrer', 'referral_referee', 'spend_shuffle_pack', 'spend_starter_unlock', 'admin_adjustment')
  )
);

create index if not exists credit_ledger_user_idx on public.credit_ledger (user_id, created_at desc);

-- Idempotency: a referral pays each side at most once, however many times qualification runs.
create unique index if not exists credit_ledger_referral_once
  on public.credit_ledger (referral_id, reason)
  where referral_id is not null;

alter table public.credit_ledger enable row level security;

drop policy if exists "credit_ledger_select_own" on public.credit_ledger;
create policy "credit_ledger_select_own"
  on public.credit_ledger for select
  using (auth.uid() = user_id);

-- Balance per user. security_invoker makes the view obey credit_ledger RLS for client reads.
create or replace view public.credit_balances
with (security_invoker = true)
as
  select user_id, coalesce(sum(delta), 0)::integer as balance
  from public.credit_ledger
  group by user_id;

-- ---------------------------------------------------------------------------
-- cancellation_feedback: exit survey answers from /dashboard/billing/cancel
-- ---------------------------------------------------------------------------
create table if not exists public.cancellation_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  plan text not null,
  reason text not null,
  details text,
  offer text,
  outcome text not null,
  created_at timestamptz not null default now(),
  constraint cancellation_feedback_reason_check check (
    reason in ('got_job', 'too_expensive', 'missing_feature', 'hard_to_use', 'only_once', 'other')
  ),
  constraint cancellation_feedback_outcome_check check (
    outcome in ('kept_plan', 'accepted_offer', 'downgraded', 'feedback_only')
  ),
  constraint cancellation_feedback_details_len check (details is null or char_length(details) <= 2000)
);

create index if not exists cancellation_feedback_user_idx on public.cancellation_feedback (user_id, created_at desc);

alter table public.cancellation_feedback enable row level security;

drop policy if exists "cancellation_feedback_select_own" on public.cancellation_feedback;
create policy "cancellation_feedback_select_own"
  on public.cancellation_feedback for select
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- qualify_referral: called by the publish route (service role) after a user's FIRST publish.
-- Idempotent. Enforces the referrer cap of 20 qualified referrals per rolling 30 days.
-- Returns 'none' | 'qualified' | 'rejected' | the existing status.
-- ---------------------------------------------------------------------------
create or replace function public.qualify_referral(p_referee uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.referrals%rowtype;
  recent integer;
begin
  select * into r from public.referrals where referee_id = p_referee for update;
  if not found then
    return 'none';
  end if;
  if r.status <> 'signed_up' then
    return r.status;
  end if;

  -- Serialise qualifications per referrer so two referees publishing at once cannot both slip under the cap.
  perform pg_advisory_xact_lock(hashtext('dx_referrer:' || r.referrer_id::text));

  select count(*) into recent
  from public.referrals
  where referrer_id = r.referrer_id
    and status = 'qualified'
    and qualified_at > now() - interval '30 days';

  if recent >= 20 then
    update public.referrals
      set status = 'rejected', reject_reason = 'referrer_monthly_limit'
      where id = r.id;
    return 'rejected';
  end if;

  update public.referrals
    set status = 'qualified', qualified_at = now()
    where id = r.id;

  insert into public.credit_ledger (user_id, delta, reason, referral_id)
  values
    (r.referrer_id, 1, 'referral_referrer', r.id),
    (r.referee_id, 1, 'referral_referee', r.id)
  on conflict do nothing;

  return 'qualified';
end;
$$;

revoke all on function public.qualify_referral(uuid) from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- spend_credits: balance check + debit + effect in one transaction, locked per user.
-- p_item: 'shuffle_pack' (1 credit) | 'starter_unlock' (3 credits).
-- Returns jsonb { ok, error?, balance }.
-- ---------------------------------------------------------------------------
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
  paid_active boolean;
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

  select plan, plan_expires_at into cur_plan, cur_expires
  from public.users where id = p_user for update;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'no_user');
  end if;

  paid_active := cur_plan <> 'free' and (cur_expires is null or cur_expires > now());
  if paid_active then
    -- Paid plans already include unlimited shuffles and everything Starter has. Do not take credits for nothing.
    return jsonb_build_object('ok', false, 'error', 'already_included');
  end if;

  select coalesce(sum(delta), 0)::integer into bal from public.credit_ledger where user_id = p_user;
  if bal < cost then
    return jsonb_build_object('ok', false, 'error', 'insufficient_credits', 'balance', bal);
  end if;

  insert into public.credit_ledger (user_id, delta, reason) values (p_user, -cost, ledger_reason);

  if p_item = 'starter_unlock' then
    update public.users
      set plan = 'starter', plan_expires_at = null, starter_unlocked_via_credits = true
      where id = p_user;
  end if;

  return jsonb_build_object('ok', true, 'balance', bal - cost);
end;
$$;

revoke all on function public.spend_credits(uuid, text) from public, anon, authenticated;
