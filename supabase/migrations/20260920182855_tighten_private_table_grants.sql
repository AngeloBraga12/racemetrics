-- Least-privilege grants for RaceMetrics private data.
-- RLS remains the authorization boundary; grants only expose operations the app needs.

revoke all on table public.profiles, public.preferences, public.favorites, public.saved_comparisons from authenticated;

grant select, insert, update on table public.profiles to authenticated;
grant select, insert, update on table public.preferences to authenticated;
grant select, insert, update, delete on table public.favorites to authenticated;
grant select, insert, update, delete on table public.saved_comparisons to authenticated;

revoke all on table public.profiles, public.preferences, public.favorites, public.saved_comparisons from anon;
