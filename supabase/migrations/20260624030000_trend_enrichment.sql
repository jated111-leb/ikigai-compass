-- ============================================================
-- Trend engine — enrichment / clustering (signals -> trends)
--
-- Turns the raw `signals` the collectors gather into durable, browsable
-- `trends`, deterministically and keyless (no LLM/embeddings required):
--   * signals are clustered by curated themes (trend_themes.match_terms)
--   * each theme with evidence becomes a published trend with momentum /
--     evidence / opportunity scores and a sector taxonomy link
--   * an embedding-free ranked_trends_for_me() ranks trends per mission
--
-- A later layer can replace theme-matching with embedding clusters + LLM
-- taxonomy; the table shapes stay the same.
-- ============================================================

-- ------------------------------------------------------------
-- Seed the faceted taxonomy (global; no region is privileged).
-- Sector keys mirror the app's world-need categories so a user's mission
-- (mission_profiles.sector_weights) lines up with trend classifications.
-- ------------------------------------------------------------
INSERT INTO public.taxonomy_nodes (facet, key, label, status) VALUES
  ('sector', 'beautiful-world',     'A More Beautiful World',     'approved'),
  ('sector', 'compassionate-world', 'A More Compassionate World', 'approved'),
  ('sector', 'healthier-world',     'A Healthier World',          'approved'),
  ('sector', 'prosperous-world',    'A More Prosperous World',    'approved'),
  ('sector', 'truthful-world',      'A More Truthful World',      'approved'),
  ('geo',    'global',              'Global',                     'approved'),
  ('geo',    'africa',              'Africa',                     'approved'),
  ('geo',    'asia',                'Asia',                       'approved'),
  ('geo',    'europe',              'Europe',                     'approved'),
  ('geo',    'north-america',       'North America',              'approved'),
  ('geo',    'south-america',       'South America',              'approved'),
  ('geo',    'oceania',             'Oceania',                    'approved'),
  ('geo',    'middle-east',         'Middle East',                'approved')
ON CONFLICT (facet, key) DO NOTHING;

-- ------------------------------------------------------------
-- Curated clustering themes. Each becomes (at most) one trend.
-- match_terms are lowercased phrases looked for in signal text/keywords.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.trend_themes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key         TEXT NOT NULL UNIQUE,
  label       TEXT NOT NULL,
  sector_key  TEXT NOT NULL,                 -- -> taxonomy_nodes(facet='sector')
  trend_type  public.trend_type NOT NULL,
  match_terms TEXT[] NOT NULL,
  enabled     BOOLEAN NOT NULL DEFAULT true
);

ALTER TABLE public.trend_themes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can read themes" ON public.trend_themes
  FOR SELECT TO authenticated USING (true);

INSERT INTO public.trend_themes (key, label, sector_key, trend_type, match_terms) VALUES
  ('climate-tech', 'Climate Tech', 'healthier-world', 'innovation',
    ARRAY['climate tech','climate technology','carbon capture','decarbonization']),
  ('renewable-energy', 'Renewable Energy', 'healthier-world', 'innovation',
    ARRAY['renewable energy','solar power','wind power','clean energy']),
  ('circular-economy', 'Circular Economy', 'healthier-world', 'consumer',
    ARRAY['circular economy','recycling','upcycling','zero waste']),
  ('regenerative-agriculture', 'Regenerative Agriculture', 'healthier-world', 'innovation',
    ARRAY['regenerative agriculture','regenerative farming','agritech','vertical farming']),
  ('mental-health-tech', 'Mental Health Tech', 'healthier-world', 'product',
    ARRAY['mental health','wellbeing app','therapy app','mindfulness']),
  ('digital-health', 'Digital Health', 'healthier-world', 'innovation',
    ARRAY['digital health','telehealth','healthtech','medtech']),
  ('financial-inclusion', 'Financial Inclusion', 'prosperous-world', 'startup',
    ARRAY['fintech','financial inclusion','digital banking','mobile payments']),
  ('education-technology', 'Education Technology', 'prosperous-world', 'product',
    ARRAY['education technology','edtech','online learning','e-learning']),
  ('future-of-work', 'Future of Work', 'prosperous-world', 'consumer',
    ARRAY['future of work','remote work','hybrid work','workforce']),
  ('creator-economy', 'Creator Economy', 'beautiful-world', 'content',
    ARRAY['creator economy','content creator','influencer','content monetization']),
  ('sustainable-design', 'Sustainable Design', 'beautiful-world', 'innovation',
    ARRAY['sustainable design','eco design','sustainable materials','green design']),
  ('social-impact', 'Social Impact Ventures', 'compassionate-world', 'startup',
    ARRAY['social impact','social enterprise','impact startup','nonprofit tech'])
ON CONFLICT (key) DO NOTHING;

-- ------------------------------------------------------------
-- build_trends_from_signals(lookback_days)
-- Clusters recent signals by theme and (re)builds the matching trends.
-- SECURITY DEFINER so cron / service callers can write the curated tables.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.build_trends_from_signals(lookback_days INT DEFAULT 30)
RETURNS TABLE (theme TEXT, trend UUID, signals INT, momentum NUMERIC)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r           RECORD;
  th          RECORD;
  v_trend     UUID;
  v_node      UUID;
  v_momentum  NUMERIC;
  v_evidence  NUMERIC;
  v_opp       NUMERIC;
  v_maturity  public.maturity_stage;
BEGIN
  -- Recent signals joined to their source (for credibility weighting).
  CREATE TEMP TABLE _sig ON COMMIT DROP AS
    SELECT s.id, s.signal_type, s.source_id, s.title, s.summary, s.keywords,
           COALESCE(s.observed_at, s.created_at) AS eff, s.metric_value,
           ts.access_policy
    FROM public.signals s
    JOIN public.trend_sources ts ON ts.id = s.source_id
    WHERE COALESCE(s.observed_at, s.created_at) >= now() - make_interval(days => GREATEST(1, lookback_days));

  -- Assign each signal to every theme whose terms it matches.
  CREATE TEMP TABLE _st ON COMMIT DROP AS
    SELECT t.key AS theme_key, _sig.*
    FROM _sig
    JOIN public.trend_themes t ON t.enabled AND EXISTS (
      SELECT 1 FROM unnest(t.match_terms) mt
      WHERE position(
        lower(mt) IN
        lower(coalesce(_sig.title,'') || ' ' || coalesce(_sig.summary,'') || ' ' ||
              array_to_string(_sig.keywords, ' '))
      ) > 0
    );

  -- Per-signal momentum: within-type metric percentile blended with recency.
  -- Cast to numeric (percent_rank() is double precision; round(double,int) errors).
  CREATE TEMP TABLE _stm ON COMMIT DROP AS
    SELECT *,
      (( 0.6 * percent_rank() OVER (PARTITION BY signal_type ORDER BY COALESCE(metric_value, 0))
      + 0.4 * percent_rank() OVER (ORDER BY eff) ) * 100)::numeric AS smom
    FROM _st;

  FOR r IN
    SELECT theme_key,
           count(*)                  AS sc,
           count(DISTINCT source_id) AS src,
           avg(smom)                 AS am,
           min(eff)                  AS fs,
           max(eff)                  AS ls,
           avg(CASE access_policy
                 WHEN 'api_licensed' THEN 1.0 WHEN 'manual' THEN 0.7
                 WHEN 'api_public' THEN 0.85 WHEN 'rss' THEN 0.6
                 WHEN 'light_meta' THEN 0.4 ELSE 0.3 END) * 100 AS cred
    FROM _stm
    GROUP BY theme_key
  LOOP
    SELECT * INTO th FROM public.trend_themes WHERE key = r.theme_key;

    -- Composite scores (0..100), all bounded and explainable.
    v_momentum := round(0.6 * r.am + 0.4 * LEAST(100, r.sc / 20.0 * 100), 2);
    v_evidence := round(0.5 * LEAST(100, r.src / 5.0 * 100)
                      + 0.3 * LEAST(100, r.sc / 15.0 * 100)
                      + 0.2 * r.cred, 2);
    -- Opportunity heuristic: demand (momentum) tempered by how validated/
    -- crowded the evidence already is. Placeholder until a market layer exists.
    v_opp := round(0.6 * v_momentum + 0.4 * (100 - 0.5 * v_evidence), 2);

    v_maturity := CASE
      WHEN r.sc >= 25 THEN 'mainstream'
      WHEN r.sc >= 12 THEN 'scaling'
      WHEN r.sc >= 4  THEN 'emerging'
      ELSE 'weak-signal' END::public.maturity_stage;

    INSERT INTO public.trends
      (slug, title, thesis, trend_type, maturity_stage, momentum_score,
       evidence_score, opportunity_score, signal_count, first_seen_at,
       last_seen_at, enrichment_version, status)
    VALUES
      ('theme-' || th.key, th.label,
       'Signals across ' || r.src || ' sources clustering around ' || lower(th.label) || '.',
       th.trend_type, v_maturity, v_momentum, v_evidence, v_opp, r.sc,
       r.fs, r.ls, 'theme-v1', 'published')
    ON CONFLICT (slug) DO UPDATE SET
      momentum_score    = EXCLUDED.momentum_score,
      evidence_score    = EXCLUDED.evidence_score,
      opportunity_score = EXCLUDED.opportunity_score,
      maturity_stage    = EXCLUDED.maturity_stage,
      signal_count      = EXCLUDED.signal_count,
      first_seen_at     = LEAST(public.trends.first_seen_at, EXCLUDED.first_seen_at),
      last_seen_at      = GREATEST(public.trends.last_seen_at, EXCLUDED.last_seen_at),
      thesis            = EXCLUDED.thesis,
      status            = 'published',
      updated_at        = now()
    RETURNING id INTO v_trend;

    -- Rebuild evidence links. (_stm's signal id column comes from signals.id.)
    DELETE FROM public.trend_signals WHERE trend_id = v_trend;
    INSERT INTO public.trend_signals (trend_id, signal_id, weight, is_primary)
      SELECT v_trend, _stm.id, 1, false FROM _stm WHERE theme_key = r.theme_key
      ON CONFLICT (trend_id, signal_id) DO NOTHING;

    -- Sector taxonomy link.
    SELECT id INTO v_node FROM public.taxonomy_nodes
      WHERE facet = 'sector' AND key = th.sector_key;
    IF v_node IS NOT NULL THEN
      INSERT INTO public.trend_taxonomy (trend_id, node_id, confidence, source)
        VALUES (v_trend, v_node, 1, 'human')
        ON CONFLICT (trend_id, node_id) DO NOTHING;
    END IF;

    -- Score snapshot for acceleration / sparklines.
    INSERT INTO public.trend_scores (trend_id, momentum_score, evidence_score)
      VALUES (v_trend, v_momentum, v_evidence);

    theme := th.label; trend := v_trend; signals := r.sc; momentum := v_momentum;
    RETURN NEXT;
  END LOOP;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.build_trends_from_signals(INT) FROM public;
GRANT EXECUTE ON FUNCTION public.build_trends_from_signals(INT) TO service_role;

-- ------------------------------------------------------------
-- Embedding-free trend ranking per mission (replaces the v1 cosine-only one).
-- Relevance = sector-weight overlap + keyword overlap (+ optional geo match).
-- Drop first: the return shape changed (adds signal_count), which
-- CREATE OR REPLACE cannot do.
-- ------------------------------------------------------------
DROP FUNCTION IF EXISTS public.ranked_trends_for_me(NUMERIC, NUMERIC, NUMERIC, NUMERIC, INT);

CREATE OR REPLACE FUNCTION public.ranked_trends_for_me(
  w_relevance   NUMERIC DEFAULT 0.45,
  w_momentum    NUMERIC DEFAULT 0.25,
  w_opportunity NUMERIC DEFAULT 0.20,
  w_evidence    NUMERIC DEFAULT 0.10,
  max_rows      INT     DEFAULT 50
)
RETURNS TABLE (
  trend_id          UUID,
  title             TEXT,
  thesis            TEXT,
  trend_type        public.trend_type,
  maturity_stage    public.maturity_stage,
  signal_count      INT,
  momentum_score    NUMERIC,
  opportunity_score NUMERIC,
  evidence_score    NUMERIC,
  relevance_score   NUMERIC,
  match_score       NUMERIC
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  WITH me AS (
    SELECT keywords, sector_weights, geo_focus
    FROM public.mission_profiles WHERE user_id = auth.uid()
  ),
  scored AS (
    SELECT
      t.id, t.title, t.thesis, t.trend_type, t.maturity_stage, t.signal_count,
      t.momentum_score, t.opportunity_score, t.evidence_score,
      -- sector overlap: mission weight on the trend's sector nodes (0..1)
      COALESCE((
        SELECT sum( (m.sector_weights->>tn.key)::numeric * tt.confidence )
        FROM public.trend_taxonomy tt
        JOIN public.taxonomy_nodes tn ON tn.id = tt.node_id AND tn.facet = 'sector'
        WHERE tt.trend_id = t.id
          AND m.sector_weights IS NOT NULL AND m.sector_weights ? tn.key
      ), 0) AS sector_overlap,
      -- keyword overlap: share of mission keywords present in the trend text
      CASE
        WHEN m.keywords IS NULL OR COALESCE(array_length(m.keywords, 1), 0) = 0 THEN 0
        ELSE (
          SELECT count(*)::numeric FROM unnest(m.keywords) k
          WHERE position(lower(k) IN
            lower(t.title || ' ' || coalesce(t.thesis,'') || ' ' || coalesce(t.description,''))) > 0
        ) / GREATEST(1, array_length(m.keywords, 1))
      END AS keyword_share
    FROM public.trends t
    LEFT JOIN me m ON true
    WHERE t.status = 'published'
  )
  SELECT
    id, title, thesis, trend_type, maturity_stage, signal_count,
    momentum_score, opportunity_score, evidence_score,
    ROUND(LEAST(100, (0.6 * sector_overlap + 0.4 * keyword_share) * 100), 2) AS relevance_score,
    ROUND(
        w_relevance   * LEAST(100, (0.6 * sector_overlap + 0.4 * keyword_share) * 100)
      + w_momentum    * momentum_score
      + w_opportunity * opportunity_score
      + w_evidence    * evidence_score
    , 2) AS match_score
  FROM scored
  ORDER BY match_score DESC
  LIMIT max_rows;
$$;
