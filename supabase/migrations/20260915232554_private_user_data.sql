-- RaceMetrics private user data foundation
-- Apply through Supabase migrations. Never expose service_role credentials in the browser.

create extension if not exists pgcrypto;

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
  density text not null default 'comfortable' check (density in ('compact', 'comfortable')),
  favorite_series text not null default 'f1',
  updated_at timestamptz not null default now()
);

create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entity_type text not null check (entity_type in ('driver', 'team', 'race', 'circuit')),
  entity_id text not null,
  created_at timestamptz not null default now(),
  unique (user_id, entity_type, entity_id)
);

create table if not exists public.saved_comparisons (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  comparison_type text not null check (comparison_type in ('driver-driver', 'team-team', 'driver-teammate')),
  left_entity_id text not null,
  right_entity_id text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists favorites_user_id_idx on public.favorites(user_id);
create index if not exists saved_comparisons_user_id_idx on public.saved_comparisons(user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists preferences_set_updated_at on public.preferences;
create trigger preferences_set_updated_at
before update on public.preferences
for each row execute function public.set_updated_at();

drop trigger if exists saved_comparisons_set_updated_at on public.saved_comparisons;
create trigger saved_comparisons_set_updated_at
before update on public.saved_comparisons
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''))
  on conflict (id) do nothing;

  insert into public.preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public;
revoke execute on function public.handle_new_user() from anon;
revoke execute on function public.handle_new_user() from authenticated;
grant execute on function public.handle_new_user() to postgres;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.preferences enable row level security;
alter table public.favorites enable row level security;
alter table public.saved_comparisons enable row level security;

-- Explicit ownership policies. No policy grants access to another user's rows.
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
for select to authenticated using (id = (select auth.uid()));

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
for insert to authenticated with check (id = (select auth.uid()));

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
for update to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

drop policy if exists "preferences_select_own" on public.preferences;
create policy "preferences_select_own" on public.preferences
for select to authenticated using (user_id = (select auth.uid()));

drop policy if exists "preferences_insert_own" on public.preferences;
create policy "preferences_insert_own" on public.preferences
for insert to authenticated with check (user_id = (select auth.uid()));

drop policy if exists "preferences_update_own" on public.preferences;
create policy "preferences_update_own" on public.preferences
for update to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

drop policy if exists "favorites_select_own" on public.favorites;
create policy "favorites_select_own" on public.favorites
for select to authenticated using (user_id = (select auth.uid()));

drop policy if exists "favorites_insert_own" on public.favorites;
create policy "favorites_insert_own" on public.favorites
for insert to authenticated with check (user_id = (select auth.uid()));

drop policy if exists "favorites_update_own" on public.favorites
for update to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

drop policy if exists "favorites_delete_own" on public.favorites;
create policy "favorites_delete_own" on public.favorites
for delete to authenticated using (user_id = (select auth.uid()));

drop policy if exists "saved_comparisons_select_own" on public.saved_comparisons;
create policy "saved_comparisons_select_own" on public.saved_comparisons
for select to authenticated using (user_id = (select auth.uid()));

drop policy if exists "saved_comparisons_insert_own" on public.saved_comparisons;
create policy "saved_comparisons_insert_own" on public.saved_comparisons
for insert to authenticated with check (user_id = (select auth.uid()));

drop policy if exists "saved_comparisons_update_own" on public.saved_comparisons;
create policy "saved_comparisons_update_own" on public.saved_comparisons
for update to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

drop policy if exists "saved_comparisons_delete_own" on public.saved_comparisons;
create policy "saved_comparisons_delete_own" on public.saved_comparisons
for delete to authenticated using (user_id = (select auth.uid()));

revoke all on public.profiles from anon;
revoke all on public.preferences from anon;
revoke all on public.favorites from anon;
revoke all on public.saved_comparisons from anon;
