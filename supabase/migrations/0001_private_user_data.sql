-- RaceMetrics private user data foundation
-- This migration intentionally contains only user-owned application data.
-- Public motorsport reference data belongs to a separate schema/model.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  theme text not null default 'dark' check (theme in ('dark', 'light', 'system')),
  default_season integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entity_type text not null check (entity_type in ('driver', 'team', 'race', 'circuit')),
  entity_key text not null,
  created_at timestamptz not null default now(),
  unique (user_id, entity_type, entity_key)
);

create table if not exists public.saved_comparisons (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  comparison_type text not null check (comparison_type in ('driver', 'team', 'teammate')),
  left_entity_key text not null,
  right_entity_key text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.preferences enable row level security;
alter table public.favorites enable row level security;
alter table public.saved_comparisons enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  to authenticated
  with check ((select auth.uid()) = id);

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "preferences_all_own"
  on public.preferences for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "favorites_all_own"
  on public.favorites for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "saved_comparisons_all_own"
  on public.saved_comparisons for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create index if not exists favorites_user_id_idx on public.favorites(user_id);
create index if not exists saved_comparisons_user_id_idx on public.saved_comparisons(user_id);

-- New accounts receive a private profile row. The trigger performs no
-- privileged application authorization and does not expose auth metadata.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke all on function public.handle_new_user() from public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
