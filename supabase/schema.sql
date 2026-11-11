-- =========================================================
-- F1: Profiles (one row per user: name, role, active)
-- =========================================================

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 100),
  role text not null default 'field_worker'
    check (role in ('admin', 'dispatcher', 'supervisor', 'field_worker')),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Users can read their own profile. Nobody can change roles from the app.
-- (F2 adds more read rules, for example Dispatchers seeing everyone.)
create policy "Users can read their own profile"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

-- Make a profile automatically when someone signs up.
-- New users always start as Field Workers (the column default).
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, name)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'name'), ''), split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =========================================================
-- F2: Role helpers (every later policy uses these)
-- =========================================================

-- The logged-in user's role, or null if they're logged out or deactivated.
-- Policies use this, so a deactivated user is treated as logged out everywhere.
create function public.my_role()
returns text
language sql
stable
security definer set search_path = ''
as $$
  select role from public.profiles
  where id = (select auth.uid()) and is_active
$$;

-- True for Dispatchers and Admins (the "office" roles).
create function public.is_office()
returns boolean
language sql
stable
security definer set search_path = ''
as $$
  select coalesce(public.my_role() in ('admin', 'dispatcher'), false)
$$;

-- Dispatchers and Admins can see everyone (needed to assign crews in F7).
create policy "Office can read all profiles"
  on public.profiles for select
  to authenticated
  using (public.is_office());

-- =========================================================
-- F6: Jobs
-- =========================================================

create table public.jobs (
  id bigint generated always as identity primary key,
  title text not null check (char_length(btrim(title)) between 1 and 120),
  client_name text check (char_length(client_name) <= 120),
  address text not null check (char_length(btrim(address)) between 1 and 200),
  date date not null,
  start_time time without time zone not null,
  end_time time without time zone not null,
  workers_needed integer not null default 1 check (workers_needed between 1 and 50),
  notes text check (char_length(notes) <= 2000),
  status text not null default 'open'
    check (status in ('open', 'staffed', 'in_progress', 'completed', 'cancelled')),
  created_by uuid not null default auth.uid()
    references public.profiles (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Equal times are rejected. An earlier end time means overnight (the app handles that).
  constraint jobs_end_not_equal_start check (start_time <> end_time)
);

-- The job list sorts by date, then start time
create index jobs_date_start_time_idx on public.jobs (date, start_time);

alter table public.jobs enable row level security;

-- Office roles (Dispatcher, Admin) can read every job.
-- (F7 adds a policy so workers can read jobs they're assigned to.)
create policy "Office can read jobs"
  on public.jobs for select
  to authenticated
  using (public.is_office());

-- Office roles can create jobs, and created_by must be themselves.
create policy "Office can create jobs"
  on public.jobs for insert
  to authenticated
  with check (public.is_office() and created_by = (select auth.uid()));

-- Office roles can edit jobs.
-- (The status rules come later as a trigger.)
create policy "Office can edit jobs"
  on public.jobs for update
  to authenticated
  using (public.is_office())
  with check (public.is_office());

-- Office roles can delete jobs.
create policy "Office can delete jobs"
  on public.jobs for delete
  to authenticated
  using (public.is_office());

-- Final jobs (completed or cancelled) can't be changed.
-- Milestone 7 grows this into the full status rules.
create function public.protect_final_jobs()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.status in ('completed', 'cancelled') then
    -- PT409 makes Supabase answer with HTTP 409 (conflict), matching the F6 plan
    raise exception 'This job can no longer be edited' using errcode = 'PT409';
  end if;
  return new;
end;
$$;

create trigger jobs_protect_final
  before update on public.jobs
  for each row execute function public.protect_final_jobs();

-- =========================================================
-- F6: Status rules
-- =========================================================

-- Grow the trigger into the full set of job rules.
-- (create or replace keeps the existing trigger attached.)
create or replace function public.protect_final_jobs()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  -- 1. Final jobs can't change at all
  if old.status in ('completed', 'cancelled') then
    raise exception 'This job can no longer be edited' using errcode = 'PT409';
  end if;

  -- 2. Status can only move along allowed paths
  if new.status is distinct from old.status then
    if not (
      (new.status = 'in_progress' and old.status in ('open', 'staffed')) or
      (new.status = 'completed'   and old.status = 'in_progress') or
      (new.status = 'cancelled'   and old.status in ('open', 'staffed', 'in_progress')) or
      (new.status = 'staffed'     and old.status = 'open') or     -- automatic, F7 only
      (new.status = 'open'        and old.status = 'staffed')       -- automatic, F7 only
    ) then
      raise exception 'That status change is not allowed' using errcode = 'PT409';
    end if;
  end if;

  return new;
end;
$$;

-- The browser may edit job details, but never status or created_by directly.
revoke update on public.jobs from authenticated, anon;
grant update (title, client_name, address, date, start_time, end_time, workers_needed, notes, updated_at)
  on public.jobs to authenticated;

-- New jobs always start as Open and belong to whoever created them.
revoke insert on public.jobs from authenticated, anon;
grant insert (title, client_name, address, date, start_time, end_time, workers_needed, notes)
  on public.jobs to authenticated;

-- The only way a person can change a job's status.
create function public.set_job_status(p_job_id bigint, p_status text)
returns void
language plpgsql
security definer set search_path = ''
as $$
begin
  if not public.is_office() then
    raise exception 'You do not have access to this action' using errcode = 'PT403';
  end if;

  -- Open and Staffed are set automatically in F7, never by hand
  if p_status not in ('in_progress', 'completed', 'cancelled') then
    raise exception 'That status change is not allowed' using errcode = 'PT409';
  end if;

  -- Lock the row so two people can't change it at the same moment
  perform 1 from public.jobs where id = p_job_id for update;
  if not found then
    raise exception 'Not found' using errcode = 'PT404';
  end if;

  -- The trigger checks the move itself
  update public.jobs set status = p_status, updated_at = now() where id = p_job_id;
end;
$$;

revoke execute on function public.set_job_status(bigint, text) from public, anon;
grant execute on function public.set_job_status(bigint, text) to authenticated;