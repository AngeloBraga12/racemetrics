-- The composite unique constraint already indexes user_id as its leading column.
-- Keep the dedicated single-column index out of the schema to avoid redundant storage and maintenance cost.
drop index if exists public.favorites_user_id_idx;

drop index if exists public.favorites_user_entity_unique;
