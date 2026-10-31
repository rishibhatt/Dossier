-- Security hardening from docs/SECURITY_SEO_AUDIT_2026-11-01.md. Apply before deploying the matching app code.

-- ---------------------------------------------------------------------------
-- S2: published portfolios are no longer readable in bulk with the public anon key.
-- Public pages (/p, /u) read one row by slug or username with the service role on the server.
-- Owners still read their own rows (dashboard) and may delete them.
-- ---------------------------------------------------------------------------
drop policy if exists "published_portfolios_select_public" on public.published_portfolios;
drop policy if exists "published_portfolios_select_own" on public.published_portfolios;
create policy "published_portfolios_select_own"
  on public.published_portfolios for select
  to authenticated
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- S7: usernames are set only by /api/profile/username, which checks the reserved list.
-- A direct REST update could otherwise claim /u/admin or /u/support.
-- ---------------------------------------------------------------------------
revoke update (username) on public.users from authenticated;

-- ---------------------------------------------------------------------------
-- S8: a resume written straight through the REST API skips the route's size check. Cap it here too.
-- The route allows 256 KB of resume JSON (RESUME_LIMITS.dataBytes); pg_column_size measures the stored,
-- possibly compressed value, so this is a ceiling against abuse rather than an exact match.
-- ---------------------------------------------------------------------------
alter table public.resumes drop constraint if exists resumes_size_cap;
alter table public.resumes
  add constraint resumes_size_cap check (pg_column_size(data) + pg_column_size(design) < 400000) not valid;

-- ---------------------------------------------------------------------------
-- S4: quota check and record in one locked step, so parallel requests cannot all pass a count of 0.
-- Returns the number of uses before this one, or -1 when the caller is over `p_limit` (nothing recorded).
-- ---------------------------------------------------------------------------
create or replace function public.consume_quota(p_subject text, p_user uuid, p_kind text, p_limit integer, p_window interval default interval '24 hours')
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_used integer;
begin
  perform pg_advisory_xact_lock(hashtext(p_subject || ':' || p_kind));
  select count(*) into v_used from public.usage_events
    where subject = p_subject and kind = p_kind and created_at >= now() - p_window;
  if v_used >= p_limit then
    return -1;
  end if;
  insert into public.usage_events (subject, user_id, kind) values (p_subject, p_user, p_kind);
  return v_used;
end;
$$;
revoke all on function public.consume_quota(text, uuid, text, integer, interval) from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- S6, S9: abuse throttles (sign-in attempts, portfolio view pings). Kept apart from usage_events so they
-- never show up in the admin console's usage numbers.
-- ---------------------------------------------------------------------------
create table if not exists public.rate_events (
  id bigint generated always as identity primary key,
  subject text not null,
  kind text not null,
  created_at timestamptz not null default now()
);
create index if not exists rate_events_lookup_idx on public.rate_events (subject, kind, created_at desc);
alter table public.rate_events enable row level security;
-- No policies: only the service role reads or writes it.

create or replace function public.hit_rate_limit(p_subject text, p_kind text, p_limit integer, p_window interval)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_used integer;
begin
  perform pg_advisory_xact_lock(hashtext(p_subject || ':' || p_kind));
  select count(*) into v_used from public.rate_events
    where subject = p_subject and kind = p_kind and created_at >= now() - p_window;
  if v_used >= p_limit then
    return false;
  end if;
  insert into public.rate_events (subject, kind) values (p_subject, p_kind);
  -- Housekeeping: drop this subject's rows that no window looks at any more.
  delete from public.rate_events where subject = p_subject and kind = p_kind and created_at < now() - interval '2 days';
  return true;
end;
$$;
revoke all on function public.hit_rate_limit(text, text, integer, interval) from public, anon, authenticated;
