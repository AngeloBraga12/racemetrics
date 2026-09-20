-- Prevent duplicate favorites for the same user and entity.
create unique index if not exists favorites_user_entity_unique
  on public.favorites (user_id, entity_type, entity_id);
