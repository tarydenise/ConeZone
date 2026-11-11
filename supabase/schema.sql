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