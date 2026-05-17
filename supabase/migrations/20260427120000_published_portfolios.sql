-- Public portfolio snapshots for /p/[slug]
create table if not exists public.published_portfolios (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists published_portfolios_slug_idx on public.published_portfolios (slug);

alter table public.published_portfolios enable row level security;

create policy "published_portfolios_select_public"
  on public.published_portfolios for select
  using (true);

create policy "published_portfolios_insert_authenticated"
  on public.published_portfolios for insert
  to authenticated
  with check (true);
