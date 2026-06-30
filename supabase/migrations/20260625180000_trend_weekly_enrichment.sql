-- ============================================================
-- Trend engine — weekly cadence + re-enrich-on-change
--
-- 1. Adds change-detection columns to trends so the enrich function can
--    skip trends whose signal set hasn't materially grown (caps LLM cost).
-- 2. Reschedules ingestion + enrichment from hourly to weekly.
--
-- LLM enrichment itself runs in the `enrich` Edge Function (Lovable AI
-- Gateway / Gemini Flash) and classifies at the trend level.
-- ============================================================

-- Change-detection: enrichment_signature stores the signal_count at the last
-- LLM enrichment; enriched_at is when that ran.
ALTER TABLE public.trends ADD COLUMN IF NOT EXISTS enrichment_signature TEXT;
ALTER TABLE public.trends ADD COLUMN IF NOT EXISTS enriched_at TIMESTAMPTZ;

-- ------------------------------------------------------------
-- Weekly ingestion (Mondays 05:00 UTC). Re-run after deploy:
--   select public.schedule_trend_ingestion('https://<ref>.supabase.co', '<INGEST_SECRET>');
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.schedule_trend_ingestion(supabase_url TEXT, ingest_secret TEXT)
RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE jobid BIGINT;
BEGIN
  -- Drop the old hourly job and any prior weekly one.
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'trend-ingest-hourly') THEN
    PERFORM cron.unschedule('trend-ingest-hourly');
  END IF;
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'trend-ingest-weekly') THEN
    PERFORM cron.unschedule('trend-ingest-weekly');
  END IF;
  SELECT cron.schedule(
    'trend-ingest-weekly', '0 5 * * 1',
    format($job$SELECT net.http_post(url := %L, headers := %L::jsonb, body := '{}'::jsonb) AS request_id;$job$,
      supabase_url || '/functions/v1/ingest?source=all',
      json_build_object('Content-Type','application/json','x-ingest-key',ingest_secret)::text)
  ) INTO jobid;
  RETURN 'scheduled trend-ingest-weekly (Mon 05:00 UTC), job id ' || jobid::text;
END;$$;

-- ------------------------------------------------------------
-- LLM enrichment runs in two phases (Anthropic Batch API is async):
--   * cluster  — weekly (Mon 06:00 UTC): cluster signals, create/refresh
--                trends, and SUBMIT a Haiku batch for trends that changed.
--   * collect  — hourly: poll pending batches and apply results when ended.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.schedule_trend_enrichment(supabase_url TEXT, ingest_secret TEXT)
RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE hdr TEXT;
BEGIN
  hdr := json_build_object('Content-Type','application/json','x-ingest-key',ingest_secret)::text;
  -- Clean up any prior enrichment jobs (hourly legacy + the two new ones).
  PERFORM cron.unschedule(j) FROM (VALUES
    ('trend-enrich-hourly'),('trend-enrich-weekly'),('trend-enrich-collect')) v(j)
  WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = v.j);

  PERFORM cron.schedule(
    'trend-enrich-weekly', '0 6 * * 1',
    format($job$SELECT net.http_post(url := %L, headers := %L::jsonb, body := '{}'::jsonb) AS request_id;$job$,
      supabase_url || '/functions/v1/enrich?action=cluster', hdr));

  PERFORM cron.schedule(
    'trend-enrich-collect', '20 * * * *',
    format($job$SELECT net.http_post(url := %L, headers := %L::jsonb, body := '{}'::jsonb) AS request_id;$job$,
      supabase_url || '/functions/v1/enrich?action=collect', hdr));

  RETURN 'scheduled trend-enrich-weekly (Mon 06:00 UTC) + trend-enrich-collect (hourly)';
END;$$;

-- ------------------------------------------------------------
-- Anthropic Batch bookkeeping (internal-only: service role writes).
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.enrichment_batches (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_batch_id TEXT UNIQUE,
  status            TEXT NOT NULL DEFAULT 'submitted',  -- submitted | ended | error
  item_count        INT NOT NULL DEFAULT 0,
  submitted_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at      TIMESTAMPTZ,
  error             TEXT
);

CREATE TABLE IF NOT EXISTS public.enrichment_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id    UUID NOT NULL REFERENCES public.enrichment_batches(id) ON DELETE CASCADE,
  trend_id    UUID NOT NULL REFERENCES public.trends(id) ON DELETE CASCADE,
  custom_id   TEXT NOT NULL,
  signature   TEXT,
  status      TEXT NOT NULL DEFAULT 'pending',          -- pending | applied | failed
  applied_at  TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS enrichment_items_batch_idx ON public.enrichment_items(batch_id);

ALTER TABLE public.enrichment_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrichment_items   ENABLE ROW LEVEL SECURITY;
-- No policies => only the service role (which bypasses RLS) can read/write.

-- JTBD upsert target for the enricher (family + statement is the natural key).
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'jtbd_family_statement_key') THEN
    ALTER TABLE public.jtbd ADD CONSTRAINT jtbd_family_statement_key UNIQUE (family, statement);
  END IF;
END $$;

-- CREATE OR REPLACE preserves grants, but re-assert for clarity.
REVOKE EXECUTE ON FUNCTION public.schedule_trend_ingestion(text, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.schedule_trend_enrichment(text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.schedule_trend_ingestion(text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.schedule_trend_enrichment(text, text) TO service_role;
