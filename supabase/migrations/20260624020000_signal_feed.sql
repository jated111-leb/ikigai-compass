-- ============================================================
-- Trend engine — personalized signal feed
--
-- The collectors populate `signals` directly. Clustering signals into
-- enriched `trends` (with embeddings + LLM taxonomy) is a later layer, so
-- this RPC ranks the raw signals we already have against a user's mission
-- profile. It is the data source for the Trends page in the app.
--
-- Relevance here is keyword/sector overlap (no embeddings required);
-- momentum is a within-type percentile of the source metric blended with
-- recency. Falls back to momentum-only ranking for users without a profile.
-- ============================================================

CREATE OR REPLACE FUNCTION public.ranked_signals_for_me(
  lookback_days INT     DEFAULT 30,
  w_relevance   NUMERIC DEFAULT 0.6,
  w_momentum    NUMERIC DEFAULT 0.4,
  max_rows      INT     DEFAULT 60
)
RETURNS TABLE (
  signal_id       UUID,
  title           TEXT,
  summary         TEXT,
  url             TEXT,
  source_name     TEXT,
  signal_type     public.signal_type,
  metric_value    NUMERIC,
  metric_unit     TEXT,
  geo_hint        TEXT,
  observed_at     TIMESTAMPTZ,
  momentum_score  NUMERIC,
  relevance_score NUMERIC,
  match_score     NUMERIC
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  WITH me AS (
    SELECT keywords, sector_weights, geo_focus
    FROM public.mission_profiles
    WHERE user_id = auth.uid()
  ),
  cutoff AS (
    SELECT now() - make_interval(days => GREATEST(1, lookback_days)) AS since,
           now() AS now_ts
  ),
  recent AS (
    SELECT
      s.id, s.title, s.summary, s.url, s.signal_type, s.metric_value,
      s.metric_unit, s.geo_hint, s.keywords, s.observed_at, s.source_id,
      COALESCE(s.observed_at, s.created_at) AS effective_at
    FROM public.signals s, cutoff c
    WHERE COALESCE(s.observed_at, s.created_at) >= c.since
  ),
  scored AS (
    SELECT
      r.*,
      ts.name AS source_name,
      -- Momentum: within-type percentile of the metric (so stars/upvotes/
      -- articles are comparable) blended with recency within the window.
      ( 0.6 * percent_rank() OVER (
                PARTITION BY r.signal_type ORDER BY COALESCE(r.metric_value, 0))
      + 0.4 * percent_rank() OVER (ORDER BY r.effective_at)
      ) * 100 AS momentum_score,
      -- Relevance: share of the user's mission keywords that appear in the
      -- signal text/keywords, with a small sector-term and geo bonus.
      (
        CASE
          WHEN (SELECT keywords FROM me) IS NULL
            OR COALESCE(array_length((SELECT keywords FROM me), 1), 0) = 0
          THEN 0
          ELSE LEAST(1.0,
            ( SELECT count(*)::numeric
              FROM unnest((SELECT keywords FROM me)) k
              WHERE position(
                lower(k) IN
                lower(coalesce(r.title,'') || ' ' || coalesce(r.summary,'') || ' ' ||
                      array_to_string(r.keywords, ' '))
              ) > 0
            ) / GREATEST(1, array_length((SELECT keywords FROM me), 1))
          )
        END
      ) * 80
      +
      -- Sector-term bonus: any mission sector key word present in the text.
      (
        CASE WHEN EXISTS (
          SELECT 1
          FROM jsonb_object_keys(COALESCE((SELECT sector_weights FROM me), '{}'::jsonb)) sk
          WHERE position(
            replace(sk, '-', ' ') IN
            lower(coalesce(r.title,'') || ' ' || coalesce(r.summary,''))
          ) > 0
        ) THEN 12 ELSE 0 END
      )
      +
      -- Geo bonus: signal geo matches a focus region.
      (
        CASE WHEN (SELECT geo_focus FROM me) IS NOT NULL
              AND lower(coalesce(r.geo_hint,'')) = ANY (
                    SELECT lower(g) FROM unnest((SELECT geo_focus FROM me)) g)
        THEN 8 ELSE 0 END
      ) AS relevance_raw
    FROM recent r
    JOIN public.trend_sources ts ON ts.id = r.source_id
  )
  SELECT
    id, title, summary, url, source_name, signal_type, metric_value,
    metric_unit, geo_hint, observed_at,
    ROUND(momentum_score, 2) AS momentum_score,
    ROUND(LEAST(100, relevance_raw), 2) AS relevance_score,
    ROUND(w_relevance * LEAST(100, relevance_raw) + w_momentum * momentum_score, 2) AS match_score
  FROM scored
  ORDER BY match_score DESC
  LIMIT max_rows;
$$;
