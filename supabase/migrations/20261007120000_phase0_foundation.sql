-- Phase 0 foundation: plans, usernames, portfolio ownership, usage quotas, billing tables.
-- Apply after 20260427120000_published_portfolios.sql.

-- ---------------------------------------------------------------------------
-- users: plan + username
-- ---------------------------------------------------------------------------
alter table public.users
  add column if not exists username text,
  add column if not exists plan text not null default 'free',
  add column if not exists plan_expires_at timestamptz;

alter table public.users
  drop constraint if exists users_plan_check;
alter table public.users
  add constraint users_plan_check check (plan in ('free', 'starter', 'pro'));

alter table public.users
  drop constraint if exists users_username_format;
alter table public.users
  add constraint users_username_format check (username is null or username ~ '^[a-z0-9][a-z0-9-]{2,29}$');

create unique index if not exists users_username_unique on public.users (username) where username is not null;

-- SECURITY: the existing "users_update_own" policy lets a user update any column of their row,
-- which would let them set plan = 'pro'. Restrict client writes to harmless columns.
-- Plan changes happen only via the service role (payment webhooks).
revoke insert, update on public.users from anon, authenticated;
grant update (full_name, avatar_url, username) on public.users to authenticated;

-- ---------------------------------------------------------------------------
-- published_portfolios: ownership, indexing flag, owner-only writes
-- ---------------------------------------------------------------------------
alter table public.published_portfolios
  add column if not exists user_id uuid references public.users (id) on delete cascade,
  add column if not exists indexable boolean not null default false,
  add column if not exists updated_at timestamptz not null default now();

create index if not exists published_portfolios_user_idx on public.published_portfolios (user_id);

drop trigger if exists published_portfolios_set_updated_at on public.published_portfolios;
create trigger published_portfolios_set_updated_at
before update on public.published_portfolios
for each row execute function public.set_updated_at();

drop policy if exists "published_portfolios_insert_authenticated" on public.published_portfolios;

drop policy if exists "published_portfolios_insert_own" on public.published_portfolios;
create policy "published_portfolios_insert_own"
  on public.published_portfolios for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "published_portfolios_update_own" on public.published_portfolios;
create policy "published_portfolios_update_own"
  on public.published_portfolios for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "published_portfolios_delete_own" on public.published_portfolios;
create policy "published_portfolios_delete_own"
  on public.published_portfolios for delete
  to authenticated
  using (auth.uid() = user_id);

-- Public read stays ("published_portfolios_select_public"): /p/[slug] renders for anyone with the link.

-- ---------------------------------------------------------------------------
-- usage_events: quota + rate-limit ledger. Written ONLY by the service role.
-- subject = 'u:<user uuid>' for signed-in users, 'ip:<salted hash>' for anonymous callers.
-- ---------------------------------------------------------------------------
create table if not exists public.usage_events (
  id bigint generated always as identity primary key,
  subject text not null,
  user_id uuid references public.users (id) on delete cascade,
  kind text not null,
  created_at timestamptz not null default now()
);

create index if not exists usage_events_lookup_idx on public.usage_events (subject, kind, created_at desc);

alter table public.usage_events enable row level security;

drop policy if exists "usage_events_select_own" on public.usage_events;
create policy "usage_events_select_own"
  on public.usage_events for select
  using (auth.uid() = user_id);

-- Housekeeping: call periodically (Supabase scheduled function / GitHub Action) to keep the table small.
create or replace function public.prune_usage_events(older_than interval default interval '3 days')
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.usage_events where created_at < now() - older_than;
$$;

revoke all on function public.prune_usage_events(interval) from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Billing tables (written only by the service role from payment webhooks)
-- ---------------------------------------------------------------------------
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  provider text not null,
  provider_subscription_id text,
  plan text not null check (plan in ('starter', 'pro')),
  status text not null,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint subscriptions_provider_unique unique (provider, provider_subscription_id)
);

create index if not exists subscriptions_user_idx on public.subscriptions (user_id);

drop trigger if exists subscriptions_set_updated_at on public.subscriptions;
create trigger subscriptions_set_updated_at
before update on public.subscriptions
for each row execute function public.set_updated_at();

alter table public.subscriptions enable row level security;

drop policy if exists "subscriptions_select_own" on public.subscriptions;
create policy "subscriptions_select_own"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- Webhook idempotency: one row per provider event id. No client policies at all.
create table if not exists public.payment_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  provider_event_id text not null,
  payload jsonb not null,
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint payment_events_unique unique (provider, provider_event_id)
);

alter table public.payment_events enable row level security;
