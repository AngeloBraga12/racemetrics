-- Metadata-only follow-up migration for the private RaceMetrics data foundation.
comment on table public.preferences is 'RaceMetrics private user preferences';
comment on table public.favorites is 'RaceMetrics private favorites';
comment on table public.saved_comparisons is 'RaceMetrics private saved comparisons';
