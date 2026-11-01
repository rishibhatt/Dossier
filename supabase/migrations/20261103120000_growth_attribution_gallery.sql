-- Growth: first-touch attribution, "how did you hear" answers, the public gallery, and an unpublished-site nudge.
--
-- users.signup_source: where the person first came from, copied once from the `dx_src` cookie when the account
-- is created (src/lib/attribution.ts). Keys: utm_source, utm_medium, utm_campaign, utm_term, utm_content, ref,
-- referrer (host only), click (ad click id name), landing (path), at (ISO time).
-- users.heard_from: the one-tap answer in the first-publish dialog. Set once.
-- Both are written by the server with the service role only: the phase 0 column grants do not let users update them.
--
-- published_portfolios.gallery_status: null = not offered; 'pending' = the owner opted in and waits for review;
-- 'approved' = shown on /portfolio-examples; 'rejected' = reviewed and kept out. Owners change it through
-- /api/gallery (service role), admins through the console.
--
-- lifecycle_candidates gains 'life:unpublished': a resume was read into the studio 1-3 days ago and no site exists.

alter table public.users add column if not exists signup_source jsonb;
comment on column public.users.signup_source is 'First-touch attribution captured at signup (see src/lib/attribution.ts).';

alter table public.users add column if not exists heard_from text
  check (heard_from in ('google', 'linkedin', 'friend', 'reddit', 'college', 'ai', 'other'));

alter table public.published_portfolios add column if not exists gallery_status text
  check (gallery_status in ('pending', 'approved', 'rejected'));
alter table public.published_portfolios add column if not exists gallery_requested_at timestamptz;
create index if not exists published_portfolios_gallery_idx on public.published_portfolios (gallery_status, gallery_requested_at desc)
  where gallery_status is not null;

create index if not exists usage_events_user_kind_idx on public.usage_events (user_id, kind, created_at desc) where user_id is not null;

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
           (select max(e.created_at) from usage_events e where e.user_id = u.id and e.kind = 'parse') as last_parse,
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
    -- Built a site in the studio (a resume was read into it) but never published: one nudge, a day later.
    select b.id, 2, 'life:unpublished', null from base b join users u on u.id = b.id
      where u.email_product and not b.recently_mailed and not b.has_site
        and b.last_parse between now() - interval '3 days' and now() - interval '1 day'
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

-- Old usernames. When someone changes their username, the old one is kept here so /u/<old> links they already
-- shared redirect to /u/<new>, and nobody else can claim the old name for 90 days. Server (service role) only.
create table if not exists public.username_history (
  username text primary key check (username ~ '^[a-z0-9][a-z0-9-]{2,29}$'),
  user_id uuid not null references public.users (id) on delete cascade,
  released_at timestamptz not null default now()
);
create index if not exists username_history_user_idx on public.username_history (user_id);
alter table public.username_history enable row level security;
revoke all on public.username_history from anon, authenticated;
