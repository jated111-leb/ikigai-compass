-- ============================================================
-- Trend engine — scheduling (pg_cron + pg_net)
--
-- Two recurring jobs:
--   1. enrichment  — pure SQL, scheduled here (no secrets needed)
--   2. ingestion   — calls the `ingest` Edge Function over HTTP, which needs
--                    the project URL + INGEST_SECRET, so it is registered by
--                    calling schedule_trend_ingestion(...) once after deploy
--                    (keeps secrets out of the repo).
--
-- Guarded so `db push` still succeeds if the extensions aren't enabled.
-- ============================================================

DO $$
BEGIN
  CREATE EXTENSION IF NOT EXISTS pg_cron;
  CREATE EXTENSION IF NOT EXISTS pg_net;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'pg_cron/pg_net not available (%); skipping cron setup. Schedule manually.', SQLERRM;
  RETURN;
END $$;

-- Rebuild trends from the last 30 days of signals, hourly. Safe to hardcode.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'trend-enrichment-hourly') THEN
    PERFORM cron.unschedule('trend-enrichment-hourly');
  END IF;
  PERFORM cron.schedule(
    'trend-enrichment-hourly',
    '7 * * * *',
    $cmd$ SELECT public.build_trends_from_signals(30); $cmd$
  );
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Could not schedule enrichment (%).', SQLERRM;
END $$;

-- Register (or replace) the daily ingestion job. Call once after deploying the
-- function, e.g. from the SQL editor:
--   select public.schedule_trend_ingestion(
--     'https://<project-ref>.supabase.co', '<INGEST_SECRET>', '0 5 * * *');
CREATE OR REPLACE FUNCTION public.schedule_trend_ingestion(
  base_url    TEXT,
  ingest_key  TEXT,
  cron_expr   TEXT DEFAULT '0 5 * * *',
  lookback    INT  DEFAULT 7
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cmd TEXT;
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'trend-ingestion-daily') THEN
    PERFORM cron.unschedule('trend-ingestion-daily');
  END IF;

  cmd := format(
    $f$ SELECT net.http_post(
          url := %L,
          headers := jsonb_build_object('Content-Type','application/json','x-ingest-key', %L),
          body := '{}'::jsonb
        ); $f$,
    base_url || '/functions/v1/ingest?source=all&lookback=' || lookback,
    ingest_key
  );

  PERFORM cron.schedule('trend-ingestion-daily', cron_expr, cmd);
  RETURN 'scheduled trend-ingestion-daily (' || cron_expr || ')';
END;
$$;

REVOKE EXECUTE ON FUNCTION public.schedule_trend_ingestion(TEXT, TEXT, TEXT, INT) FROM public;
GRANT EXECUTE ON FUNCTION public.schedule_trend_ingestion(TEXT, TEXT, TEXT, INT) TO service_role;
