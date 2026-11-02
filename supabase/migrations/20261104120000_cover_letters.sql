-- Dossier cover letters: one row per saved letter. Like resumes, the PDF is never stored (it is typeset in the
-- browser from `data` + `design`). Owners only. The pasted job ad (`jobPost`) is stripped by /api/cover-letters
-- and stays on the device, which keeps rows small. The plan limit is enforced here, in a trigger, because
-- signed-in users can reach this table through the Supabase REST API as well as through the route.

create table if not exists public.cover_letters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  resume_id uuid references public.resumes (id) on delete set null,
  title text not null default '' check (char_length(title) <= 120),
  template_id text not null check (template_id ~ '^r[0-9]{3}-[a-z]+$'),
  company text not null default '' check (char_length(company) <= 160),
  data jsonb not null,
  design jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cover_letters_data_size check (pg_column_size(data) <= 65536),
  constraint cover_letters_design_size check (pg_column_size(design) <= 4096)
);

create index if not exists cover_letters_user_updated_idx on public.cover_letters (user_id, updated_at desc);
-- Supports the `on delete set null` from resumes without a sequential scan.
create index if not exists cover_letters_resume_idx on public.cover_letters (resume_id) where resume_id is not null;

alter table public.cover_letters enable row level security;

-- A letter may only point at a resume the same person owns.
drop policy if exists "cover_letters_select_own" on public.cover_letters;
drop policy if exists "cover_letters_insert_own" on public.cover_letters;
drop policy if exists "cover_letters_update_own" on public.cover_letters;
drop policy if exists "cover_letters_delete_own" on public.cover_letters;

create policy "cover_letters_select_own" on public.cover_letters for select to authenticated using (auth.uid() = user_id);
create policy "cover_letters_insert_own" on public.cover_letters for insert to authenticated
  with check (
    auth.uid() = user_id
    and (resume_id is null or exists (select 1 from public.resumes r where r.id = resume_id and r.user_id = auth.uid()))
  );
create policy "cover_letters_update_own" on public.cover_letters for update to authenticated
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and (resume_id is null or exists (select 1 from public.resumes r where r.id = resume_id and r.user_id = auth.uid()))
  );
create policy "cover_letters_delete_own" on public.cover_letters for delete to authenticated using (auth.uid() = user_id);

-- Free accounts keep 3 letters; Starter and Pro keep up to 200 (a fair-use ceiling, not a selling point).
create or replace function public.enforce_cover_letter_limit()
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
    v_limit := 3;
  end if;
  -- Serialise inserts per user so two tabs can't both slip under the limit.
  perform pg_advisory_xact_lock(hashtext('cover_letters:' || new.user_id::text));
  select count(*) into v_count from public.cover_letters where user_id = new.user_id;
  if v_count >= v_limit then
    raise exception 'cover_letter_limit' using errcode = 'P0001', hint = v_limit::text;
  end if;
  return new;
end;
$$;

revoke all on function public.enforce_cover_letter_limit() from public, anon, authenticated;

drop trigger if exists cover_letters_enforce_limit on public.cover_letters;
create trigger cover_letters_enforce_limit before insert on public.cover_letters
  for each row execute function public.enforce_cover_letter_limit();

-- public.touch_resume() is generic (bumps updated_at, pins user_id to the old owner), so it is reused here.
drop trigger if exists cover_letters_touch on public.cover_letters;
create trigger cover_letters_touch before update on public.cover_letters
  for each row execute function public.touch_resume();
