-- Admin console: keep test accounts out of the numbers, and make the overview cheap at any user count.
--
-- users.is_test: set for accounts made on localhost or by an admin, or ticked by hand in the console.
-- usage_events from a local dev server carry a `test:` subject prefix (see src/lib/api/guard.ts).
-- admin_overview now groups by day in one pass per table (it was one count per day per table) and every
-- range filter is on an indexed created_at.

alter table public.users add column if not exists is_test boolean not null default false;

create index if not exists users_created_idx on public.users (created_at);
create index if not exists usage_events_created_idx on public.usage_events (created_at, kind);
create index if not exists published_portfolios_created_idx on public.published_portfolios (created_at);
create index if not exists resumes_created_idx on public.resumes (created_at);

drop function if exists public.admin_overview(integer);

create or replace function public.admin_overview(p_days integer default 30, p_include_test boolean default false)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  days integer := greatest(7, least(coalesce(p_days, 30), 365));
  since timestamptz := (now() - make_interval(days => days - 1))::date;
  result jsonb;
begin
  with _u as materialized (
    select id, plan, plan_expires_at, created_at from public.users where p_include_test or not is_test
  )
  select jsonb_build_object(
    'totals', jsonb_build_object(
      'users', (select count(*) from _u),
      'users_7d', (select count(*) from _u where created_at > now() - interval '7 days'),
      'users_30d', (select count(*) from _u where created_at > now() - interval '30 days'),
      'users_range', (select count(*) from _u where created_at >= since),
      'paid', (select count(*) from _u where plan <> 'free' and (plan_expires_at is null or plan_expires_at > now())),
      'starter', (select count(*) from _u where plan = 'starter' and (plan_expires_at is null or plan_expires_at > now())),
      'pro', (select count(*) from _u where plan = 'pro' and (plan_expires_at is null or plan_expires_at > now())),
      'portfolios', (select count(*) from public.published_portfolios p join _u on _u.id = p.user_id),
      'publishers', (select count(distinct p.user_id) from public.published_portfolios p join _u on _u.id = p.user_id),
      'resumes', (select count(*) from public.resumes r join _u on _u.id = r.user_id),
      'resume_makers', (select count(distinct r.user_id) from public.resumes r join _u on _u.id = r.user_id),
      'test_users', (select count(*) from public.users where is_test),
      'credits_outstanding', (select coalesce(sum(delta), 0) from public.credit_ledger c join _u on _u.id = c.user_id),
      'messages_new', (select count(*) from public.contact_messages where status = 'new'),
      'active_subscriptions', (select count(*) from public.subscriptions s join _u on _u.id = s.user_id where s.status in ('active', 'trialing'))
    ),
    -- Activation of people who signed up inside the range: what share went on to each step.
    'cohort', (
      select jsonb_build_object(
        'signed_up', count(*),
        'made_resume', count(*) filter (where exists (select 1 from public.resumes r where r.user_id = c.id)),
        'published', count(*) filter (where exists (select 1 from public.published_portfolios p where p.user_id = c.id)),
        'paid', count(*) filter (where c.plan <> 'free')
      )
      from _u c where c.created_at >= since
    ),
    'referrals', (
      select coalesce(jsonb_object_agg(status, n), '{}'::jsonb)
      from (select r.status, count(*) as n from public.referrals r join _u on _u.id = r.referee_id group by r.status) r
    ),
    'usage_by_kind', (
      select coalesce(jsonb_object_agg(kind, n), '{}'::jsonb)
      from (
        select e.kind, count(*) as n from public.usage_events e
        where e.created_at >= since
          and (p_include_test or (e.subject not like 'test:%' and (e.user_id is null or e.user_id in (select id from _u))))
        group by e.kind
      ) u
    ),
    'daily', (
      with g as (select d::date as day from generate_series(since::date, now()::date, interval '1 day') d),
      s as (select created_at::date as day, count(*) n from _u where created_at >= since group by 1),
      p as (select p.created_at::date as day, count(*) n from public.published_portfolios p join _u on _u.id = p.user_id where p.created_at >= since group by 1),
      r as (select r.created_at::date as day, count(*) n from public.resumes r join _u on _u.id = r.user_id where r.created_at >= since group by 1),
      b as (
        select e.created_at::date as day, count(*) n from public.usage_events e
        where e.kind = 'parse' and e.created_at >= since
          and (p_include_test or (e.subject not like 'test:%' and (e.user_id is null or e.user_id in (select id from _u))))
        group by 1
      )
      select coalesce(jsonb_agg(jsonb_build_object(
        'day', g.day,
        'signups', coalesce(s.n, 0),
        'publishes', coalesce(p.n, 0),
        'resumes', coalesce(r.n, 0),
        'builds', coalesce(b.n, 0)
      ) order by g.day), '[]'::jsonb)
      from g left join s using (day) left join p using (day) left join r using (day) left join b using (day)
    )
  ) into result;
  return result;
end;
$$;

revoke all on function public.admin_overview(integer, boolean) from public, anon, authenticated;
