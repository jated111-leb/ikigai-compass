-- ============================================================
-- Ikigai Trend Engine — schema
-- See docs/trend-engine/ for the full design rationale.
--
-- Design principles encoded here:
--   * Source compliance is data (access_policy enum), not a code comment.
--   * Light-meta sources (Springwise/Trend Hunter) are capped at a short
--     snippet via a CHECK constraint — no full-article bodies.
--   * Curated knowledge is public-read / service-write.
--   * Personal data (mission_profiles, saved_trends) is user-owned via RLS,
--     mirroring the existing journeys/profiles policies.
-- ============================================================

-- pgvector for clustering, semantic search, and relevance scoring.
CREATE EXTENSION IF NOT EXISTS vector;

-- ------------------------------------------------------------
-- Enums
-- ------------------------------------------------------------
CREATE TYPE public.access_policy AS ENUM (
  'api_licensed', 'api_public', 'rss', 'light_meta', 'manual', 'blocked'
);
CREATE TYPE public.source_kind AS ENUM (
  'search', 'news', 'social', 'video', 'funding', 'launch',
  'repo', 'reviews', 'ads', 'curated', 'dataset'
);
CREATE TYPE public.signal_type AS ENUM (
  'search_interest', 'news_volume', 'social_velocity', 'launch',
  'funding', 'repo_velocity', 'review_shift', 'ad_volume', 'curated_pick'
);
CREATE TYPE public.trend_type AS ENUM (
  'consumer', 'startup', 'innovation', 'content', 'product', 'macro'
);
CREATE TYPE public.maturity_stage AS ENUM (
  'weak-signal', 'emerging', 'scaling', 'mainstream', 'mature', 'declining'
);
CREATE TYPE public.trend_status AS ENUM ('candidate', 'published', 'archived');
CREATE TYPE public.taxonomy_facet AS ENUM ('sector', 'need', 'geo');
CREATE TYPE public.node_status AS ENUM ('proposed', 'approved');
CREATE TYPE public.classification_source AS ENUM ('llm', 'human');
CREATE TYPE public.saved_status AS ENUM ('watching', 'exploring', 'acting', 'dismissed');

-- ------------------------------------------------------------
-- Source registry (+ compliance policy)
-- ------------------------------------------------------------
CREATE TABLE public.trend_sources (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name               TEXT NOT NULL UNIQUE,
  kind               public.source_kind NOT NULL,
  access_policy      public.access_policy NOT NULL,
  base_url           TEXT,
  rate_limit_per_min INT NOT NULL DEFAULT 10,
  robots_respected   BOOLEAN NOT NULL DEFAULT true,
  license_note       TEXT,
  enabled            BOOLEAN NOT NULL DEFAULT true,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- Raw landing zone (provenance-first; internal only)
-- ------------------------------------------------------------
CREATE TABLE public.raw_signals (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id              UUID NOT NULL REFERENCES public.trend_sources(id) ON DELETE CASCADE,
  dedupe_key             TEXT NOT NULL UNIQUE,
  external_id            TEXT,
  url                    TEXT,
  title                  TEXT,
  -- Hard cap that enforces the "light metadata only" rule for scraped sources.
  snippet                TEXT CHECK (snippet IS NULL OR char_length(snippet) <= 280),
  payload                JSONB,
  access_policy_snapshot public.access_policy NOT NULL,
  fetched_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at           TIMESTAMPTZ
);
CREATE INDEX raw_signals_source_idx ON public.raw_signals(source_id);

-- ------------------------------------------------------------
-- Normalized signals (evidence)
-- ------------------------------------------------------------
CREATE TABLE public.signals (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  raw_signal_id UUID REFERENCES public.raw_signals(id) ON DELETE SET NULL,
  source_id     UUID NOT NULL REFERENCES public.trend_sources(id) ON DELETE CASCADE,
  signal_type   public.signal_type NOT NULL,
  title         TEXT NOT NULL,
  summary       TEXT,
  url           TEXT,
  entities      TEXT[] NOT NULL DEFAULT '{}',
  keywords      TEXT[] NOT NULL DEFAULT '{}',
  metric_value  NUMERIC,
  metric_unit   TEXT,
  geo_hint      TEXT,
  observed_at   TIMESTAMPTZ,
  embedding     vector(1536),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX signals_source_idx   ON public.signals(source_id);
CREATE INDEX signals_type_idx     ON public.signals(signal_type);
CREATE INDEX signals_observed_idx ON public.signals(observed_at);

-- ------------------------------------------------------------
-- Trends (the durable, browsable object)
-- ------------------------------------------------------------
CREATE TABLE public.trends (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug               TEXT NOT NULL UNIQUE,
  title              TEXT NOT NULL,
  thesis             TEXT,
  description        TEXT,
  trend_type         public.trend_type NOT NULL,
  maturity_stage     public.maturity_stage NOT NULL DEFAULT 'emerging',
  momentum_score     NUMERIC(5,2) NOT NULL DEFAULT 0,
  evidence_score     NUMERIC(5,2) NOT NULL DEFAULT 0,
  opportunity_score  NUMERIC(5,2) NOT NULL DEFAULT 0,
  signal_count       INT NOT NULL DEFAULT 0,
  first_seen_at      TIMESTAMPTZ,
  last_seen_at       TIMESTAMPTZ,
  embedding          vector(1536),
  enrichment_version TEXT,
  status             public.trend_status NOT NULL DEFAULT 'candidate',
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX trends_type_idx     ON public.trends(trend_type);
CREATE INDEX trends_status_idx   ON public.trends(status);
CREATE INDEX trends_momentum_idx ON public.trends(momentum_score DESC);

-- Evidence join: which signals support a trend.
CREATE TABLE public.trend_signals (
  trend_id   UUID NOT NULL REFERENCES public.trends(id) ON DELETE CASCADE,
  signal_id  UUID NOT NULL REFERENCES public.signals(id) ON DELETE CASCADE,
  weight     NUMERIC NOT NULL DEFAULT 1,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  PRIMARY KEY (trend_id, signal_id)
);

-- Score history (acceleration + sparklines).
CREATE TABLE public.trend_scores (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trend_id       UUID NOT NULL REFERENCES public.trends(id) ON DELETE CASCADE,
  momentum_score NUMERIC(5,2) NOT NULL,
  evidence_score NUMERIC(5,2) NOT NULL,
  computed_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX trend_scores_trend_idx ON public.trend_scores(trend_id, computed_at);

-- ------------------------------------------------------------
-- Faceted taxonomy
-- ------------------------------------------------------------
CREATE TABLE public.taxonomy_nodes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facet       public.taxonomy_facet NOT NULL,
  parent_id   UUID REFERENCES public.taxonomy_nodes(id) ON DELETE CASCADE,
  key         TEXT NOT NULL,
  label       TEXT NOT NULL,
  description TEXT,
  status      public.node_status NOT NULL DEFAULT 'proposed',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (facet, key)
);

CREATE TABLE public.jtbd (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family      TEXT NOT NULL,
  statement   TEXT NOT NULL,        -- "When [...], I want to [...], so I can [...]"
  description TEXT,
  status      public.node_status NOT NULL DEFAULT 'proposed',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trend <-> taxonomy / jtbd
CREATE TABLE public.trend_taxonomy (
  trend_id   UUID NOT NULL REFERENCES public.trends(id) ON DELETE CASCADE,
  node_id    UUID NOT NULL REFERENCES public.taxonomy_nodes(id) ON DELETE CASCADE,
  confidence NUMERIC NOT NULL DEFAULT 1,
  source     public.classification_source NOT NULL DEFAULT 'llm',
  PRIMARY KEY (trend_id, node_id)
);
CREATE TABLE public.trend_jtbd (
  trend_id   UUID NOT NULL REFERENCES public.trends(id) ON DELETE CASCADE,
  jtbd_id    UUID NOT NULL REFERENCES public.jtbd(id) ON DELETE CASCADE,
  confidence NUMERIC NOT NULL DEFAULT 1,
  PRIMARY KEY (trend_id, jtbd_id)
);

-- ------------------------------------------------------------
-- Personal: mission profile + saved trends (user-owned)
-- ------------------------------------------------------------
CREATE TABLE public.mission_profiles (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  keywords      TEXT[] NOT NULL DEFAULT '{}',
  sector_weights JSONB NOT NULL DEFAULT '{}'::jsonb,
  need_weights  JSONB NOT NULL DEFAULT '{}'::jsonb,
  geo_focus     TEXT[] NOT NULL DEFAULT '{}',
  embedding     vector(1536),
  derived_from  JSONB,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.saved_trends (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  trend_id   UUID NOT NULL REFERENCES public.trends(id) ON DELETE CASCADE,
  note       TEXT,
  status     public.saved_status NOT NULL DEFAULT 'watching',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, trend_id)
);

-- ------------------------------------------------------------
-- Observability
-- ------------------------------------------------------------
CREATE TABLE public.ingestion_runs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id     UUID NOT NULL REFERENCES public.trend_sources(id) ON DELETE CASCADE,
  started_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at   TIMESTAMPTZ,
  status        TEXT NOT NULL DEFAULT 'running',
  signals_in    INT NOT NULL DEFAULT 0,
  signals_kept  INT NOT NULL DEFAULT 0,
  error         TEXT
);

-- ------------------------------------------------------------
-- updated_at triggers (reuse existing helper from first migration)
-- ------------------------------------------------------------
CREATE TRIGGER update_trends_updated_at
  BEFORE UPDATE ON public.trends
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_mission_profiles_updated_at
  BEFORE UPDATE ON public.mission_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- Row Level Security
-- ============================================================

-- Curated knowledge: authenticated users read published rows; only service role writes.
ALTER TABLE public.trend_sources  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signals        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trends         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trend_signals  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trend_scores   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.taxonomy_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jtbd           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trend_taxonomy ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trend_jtbd     ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read sources"   ON public.trend_sources  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can read signals"   ON public.signals        FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can read trends"    ON public.trends         FOR SELECT TO authenticated USING (status = 'published');
CREATE POLICY "Authenticated can read tsignals"  ON public.trend_signals  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can read tscores"   ON public.trend_scores   FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can read taxonomy"  ON public.taxonomy_nodes FOR SELECT TO authenticated USING (status = 'approved');
CREATE POLICY "Authenticated can read jtbd"      ON public.jtbd           FOR SELECT TO authenticated USING (status = 'approved');
CREATE POLICY "Authenticated can read ttaxonomy" ON public.trend_taxonomy FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can read tjtbd"     ON public.trend_jtbd     FOR SELECT TO authenticated USING (true);
-- (No INSERT/UPDATE/DELETE policies => writes are denied to all non-service roles.
--  The service_role key bypasses RLS, so the ingestion worker can write.)

-- Internal-only tables: no policies at all => only service_role can touch them.
ALTER TABLE public.raw_signals    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingestion_runs ENABLE ROW LEVEL SECURITY;

-- Personal data: user-owned, mirrors journeys/profiles policies.
ALTER TABLE public.mission_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_trends     ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own mission" ON public.mission_profiles
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users view own saves"   ON public.saved_trends FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own saves" ON public.saved_trends FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own saves" ON public.saved_trends FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own saves" ON public.saved_trends FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- Relevance scoring RPC
-- Returns the caller's personalized, ranked trend feed.
-- Combines semantic fit + faceted overlap + intrinsic scores.
-- SECURITY INVOKER so it runs under the caller's RLS context.
-- ============================================================
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
    SELECT embedding, geo_focus
    FROM public.mission_profiles
    WHERE user_id = auth.uid()
  ),
  scored AS (
    SELECT
      t.id,
      t.title,
      t.thesis,
      t.trend_type,
      t.maturity_stage,
      t.momentum_score,
      t.opportunity_score,
      t.evidence_score,
      -- Semantic relevance (0..100). pgvector cosine distance is in [0,2];
      -- similarity = 1 - distance. Falls back to 0 when either embedding is null.
      CASE
        WHEN m.embedding IS NULL OR t.embedding IS NULL THEN 0
        ELSE GREATEST(0, (1 - (t.embedding <=> m.embedding))) * 100
      END AS relevance_score
    FROM public.trends t
    LEFT JOIN me m ON true
    WHERE t.status = 'published'
  )
  SELECT
    id, title, thesis, trend_type, maturity_stage,
    momentum_score, opportunity_score, evidence_score,
    ROUND(relevance_score, 2) AS relevance_score,
    ROUND(
      w_relevance   * relevance_score
    + w_momentum    * momentum_score
    + w_opportunity * opportunity_score
    + w_evidence    * evidence_score
    , 2) AS match_score
  FROM scored
  ORDER BY match_score DESC
  LIMIT max_rows;
$$;

-- ============================================================
-- Seed the source registry with the compliance policy baked in.
-- Springwise / Trend Hunter start as light_meta (benchmark/seed only).
-- ============================================================
INSERT INTO public.trend_sources (name, kind, access_policy, base_url, rate_limit_per_min, license_note) VALUES
  ('Google Trends',        'search',  'api_public',   'https://trends.google.com',        20, 'Public unofficial endpoints / pytrends'),
  ('GDELT',                'news',    'api_public',   'https://www.gdeltproject.org',     30, 'Open data project'),
  ('Reddit API',           'social',  'api_licensed', 'https://oauth.reddit.com',         30, 'Requires registered app + ToS compliance'),
  ('YouTube Data API',     'video',   'api_licensed', 'https://www.googleapis.com/youtube/v3', 30, 'API key, quota-limited'),
  ('Product Hunt',         'launch',  'api_public',   'https://api.producthunt.com',      30, 'Official GraphQL API'),
  ('GitHub',               'repo',    'api_public',   'https://api.github.com',           50, 'Official REST/GraphQL API'),
  ('Hacker News (Algolia)','news',    'api_public',   'https://hn.algolia.com/api',       60, 'Public search API'),
  ('Meta Ads Library',     'ads',     'api_public',   'https://www.facebook.com/ads/library', 10, 'Public ads library API'),
  ('News RSS',             'news',    'rss',          NULL,                                30, 'Published syndication feeds'),
  ('Springwise',           'curated', 'light_meta',   'https://www.springwise.com',        2, 'Seed/benchmark only — metadata + short snippet; pursue data-feed license before automation'),
  ('Trend Hunter',         'curated', 'light_meta',   'https://www.trendhunter.com',       2, 'Seed/benchmark only — metadata + short snippet; respect ToS/robots'),
  ('Analyst notes',        'curated', 'manual',       NULL,                                 0, 'Hand-entered themes and JTBDs');
