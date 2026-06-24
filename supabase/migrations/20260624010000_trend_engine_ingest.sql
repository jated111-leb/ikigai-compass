-- ============================================================
-- Trend engine — ingestion support
-- Makes collectors idempotent and adds lookup indexes used by
-- the ingest Edge Function. See supabase/functions/ingest/.
-- ============================================================

-- One normalized signal per raw signal (1:1). Lets the collector
-- upsert signals on re-run without creating duplicates.
-- (raw_signal_id is nullable; Postgres allows multiple NULLs under
--  a UNIQUE constraint, which is fine for hand-inserted signals.)
ALTER TABLE public.signals
  ADD CONSTRAINT signals_raw_signal_unique UNIQUE (raw_signal_id);

-- Fast "have we seen this source's external id" checks during ingestion.
CREATE INDEX IF NOT EXISTS raw_signals_external_idx
  ON public.raw_signals (source_id, external_id);

-- Recent-runs dashboards / "last successful pull per source".
CREATE INDEX IF NOT EXISTS ingestion_runs_source_started_idx
  ON public.ingestion_runs (source_id, started_at DESC);
