-- Product catalog data is managed by migrations, especially:
-- - 001_initial_schema.sql for the initial schema and storage bucket.
-- - 012_catalog_cleanup_and_enrichment.sql for the normalized demo catalog.
--
-- This seed file intentionally stays idempotent so `supabase db reset`
-- does not insert duplicate product slugs after migrations have run.
select 'catalog seed handled by migrations' as note;
