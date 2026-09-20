begin;

create extension if not exists pgtap with schema extensions;

select plan(12);

select ok(
  (select relrowsecurity from pg_class c join pg_namespace n on n.oid = c.relnamespace
   where n.nspname = 'public' and c.relname = 'profiles'),
  'profiles has RLS enabled'
);
select ok((select relrowsecurity from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname='public' and c.relname='preferences'), 'preferences has RLS enabled');
select ok((select relrowsecurity from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname='public' and c.relname='favorites'), 'favorites has RLS enabled');
select ok((select relrowsecurity from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname='public' and c.relname='saved_comparisons'), 'saved_comparisons has RLS enabled');

select is((select count(*) from pg_policies where schemaname='public' and tablename in ('profiles','preferences','favorites','saved_comparisons') and roles @> array['authenticated']::name[]), 14::bigint, 'all private policies target authenticated');

select ok((select count(*) from information_schema.role_table_grants where grantee='anon' and table_schema='public' and table_name in ('profiles','preferences','favorites','saved_comparisons')) = 0, 'anon has no table grants');

select is((select count(*) from information_schema.role_table_grants where grantee='authenticated' and table_schema='public' and privilege_type in ('TRUNCATE','REFERENCES','TRIGGER') and table_name in ('profiles','preferences','favorites','saved_comparisons')), 0::bigint, 'authenticated has no elevated table grants');

select is((select count(*) from pg_proc where proname='handle_new_user' and prosecdef and proconfig @> array['search_path=public']), 1::bigint, 'new-user trigger function is hardened');

select ok(exists(select 1 from pg_trigger where tgname='on_auth_user_created'), 'new-user trigger exists');

select is((select count(*) from pg_policies where schemaname='public' and tablename in ('profiles','preferences','favorites','saved_comparisons') and cmd='UPDATE' and with_check is not null), 4::bigint, 'all update policies have WITH CHECK');

select ok(exists(select 1 from pg_policies where schemaname='public' and tablename='favorites' and policyname='favorites_delete_own'), 'favorites delete is explicitly authorized');

select ok(exists(select 1 from pg_policies where schemaname='public' and tablename='saved_comparisons' and policyname='saved_comparisons_delete_own'), 'saved comparisons delete is explicitly authorized');

select * from finish();
rollback;