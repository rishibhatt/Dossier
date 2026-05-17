-- Dossier core schema: public profiles + dossiers + projects + activity logs
-- Run via Supabase CLI or SQL editor after project creation.

create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key references auth.users on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.dossiers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  title text not null,
  description text,
  slug text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint dossiers_user_slug_unique unique (user_id, slug)
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  dossier_id uuid not null references public.dossiers (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  name text not null,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  entity_type text not null,
  entity_id uuid not null,
  action text not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists users_set_updated_at on public.users;
create trigger users_set_updated_at
before update on public.users
for each row execute function public.set_updated_at();

drop trigger if exists dossiers_set_updated_at on public.dossiers;
create trigger dossiers_set_updated_at
before update on public.dossiers
for each row execute function public.set_updated_at();

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
before update on public.projects
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', null)
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(excluded.full_name, public.users.full_name),
        updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.users enable row level security;
alter table public.dossiers enable row level security;
alter table public.projects enable row level security;
alter table public.activity_logs enable row level security;

create policy "users_select_own"
on public.users for select
using (auth.uid() = id);

create policy "users_update_own"
on public.users for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "users_insert_own"
on public.users for insert
with check (auth.uid() = id);

create policy "dossiers_select_own"
on public.dossiers for select
using (auth.uid() = user_id);

create policy "dossiers_insert_own"
on public.dossiers for insert
with check (auth.uid() = user_id);

create policy "dossiers_update_own"
on public.dossiers for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "dossiers_delete_own"
on public.dossiers for delete
using (auth.uid() = user_id);

create policy "projects_select_own"
on public.projects for select
using (auth.uid() = user_id);

create policy "projects_insert_own"
on public.projects for insert
with check (auth.uid() = user_id);

create policy "projects_update_own"
on public.projects for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "projects_delete_own"
on public.projects for delete
using (auth.uid() = user_id);

create policy "activity_logs_select_own"
on public.activity_logs for select
using (auth.uid() = user_id);

create policy "activity_logs_insert_own"
on public.activity_logs for insert
with check (auth.uid() = user_id);
