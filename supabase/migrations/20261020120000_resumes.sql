-- Dossier Resume: saved resumes. One row per resume; the PDF itself is never stored (it is typeset in the
-- browser from `data` + `design`). Owners only. The plan limit is enforced here, in a trigger, because
-- signed-in users can reach this table through the Supabase REST API as well as through /api/resumes.

create table if not exists public.resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  title text not null default '' check (char_length(title) <= 120),
  template_id text not null check (template_id ~ '^r[0-9]{3}-[a-z]+$'),
  template_version integer not null default 1 check (template_version > 0),
  data jsonb not null,
  design jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint resumes_data_size check (pg_column_size(data) <= 262144),
  constraint resumes_design_size check (pg_column_size(design) <= 4096)
);

create index if not exists resumes_user_updated_idx on public.resumes (user_id, updated_at desc);

alter table public.resumes enable row level security;

create policy "resumes_select_own" on public.resumes for select to authenticated using (auth.uid() = user_id);
create policy "resumes_insert_own" on public.resumes for insert to authenticated with check (auth.uid() = user_id);
create policy "resumes_update_own" on public.resumes for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "resumes_delete_own" on public.resumes for delete to authenticated using (auth.uid() = user_id);

-- Free accounts keep 2 resumes; Starter and Pro keep up to 200 (a fair-use ceiling, not a selling point).
create or replace function public.enforce_resume_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_plan text;
  v_expires timestamptz;
  v_limit integer;
  v_count integer;
begin
  select plan, plan_expires_at into v_plan, v_expires from public.users where id = new.user_id;
  if v_plan in ('starter', 'pro') and (v_expires is null or v_expires > now()) then
    v_limit := 200;
  else
    v_limit := 2;
  end if;
  -- Serialise inserts per user so two tabs can't both slip under the limit.
  perform pg_advisory_xact_lock(hashtext('resumes:' || new.user_id::text));
  select count(*) into v_count from public.resumes where user_id = new.user_id;
  if v_count >= v_limit then
    raise exception 'resume_limit' using errcode = 'P0001', hint = v_limit::text;
  end if;
  return new;
end;
$$;

revoke all on function public.enforce_resume_limit() from public, anon, authenticated;

drop trigger if exists resumes_enforce_limit on public.resumes;
create trigger resumes_enforce_limit before insert on public.resumes
  for each row execute function public.enforce_resume_limit();

create or replace function public.touch_resume()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  -- Ownership never moves.
  new.user_id := old.user_id;
  return new;
end;
$$;

drop trigger if exists resumes_touch on public.resumes;
create trigger resumes_touch before update on public.resumes
  for each row execute function public.touch_resume();
