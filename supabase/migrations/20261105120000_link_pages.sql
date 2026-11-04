-- Link-in-bio pages: one per account, shown at /l/<username>. The handle is the account's username, so
-- /l/<name> and /u/<name> always belong to the same person and cannot collide.
-- `page` holds { name, bio, theme, photo, links: [{ id, title, url, on, icon }] }, validated by /api/link-page
-- (http(s) and mailto links only). Like published portfolios, rows are written only by the server (service
-- role), so the URL checks cannot be skipped through Supabase's REST API. Owners can read and delete their row.
-- Visitors never query the table: /l/<username> reads the one published row with the service role, so nobody
-- can list every page with the public key. Public read for published rows happens there, not through RLS.

create table if not exists public.link_pages (
  user_id uuid primary key references public.users (id) on delete cascade,
  page jsonb not null,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint link_pages_page_size check (pg_column_size(page) <= 16384)
);

alter table public.link_pages enable row level security;

drop policy if exists "link_pages_select_own" on public.link_pages;
drop policy if exists "link_pages_delete_own" on public.link_pages;

create policy "link_pages_select_own" on public.link_pages for select to authenticated using (auth.uid() = user_id);
create policy "link_pages_delete_own" on public.link_pages for delete to authenticated using (auth.uid() = user_id);

revoke insert, update on public.link_pages from anon, authenticated;

-- public.touch_resume() is generic (bumps updated_at, pins user_id to the old owner), so it is reused here.
drop trigger if exists link_pages_touch on public.link_pages;
create trigger link_pages_touch before update on public.link_pages
  for each row execute function public.touch_resume();
