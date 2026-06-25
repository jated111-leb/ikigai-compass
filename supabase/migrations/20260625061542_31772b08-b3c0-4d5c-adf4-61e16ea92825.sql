
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

CREATE TYPE public.access_policy AS ENUM ('api_licensed','api_public','rss','light_meta','manual','blocked');
CREATE TYPE public.source_kind AS ENUM ('search','news','social','video','funding','launch','repo','reviews','ads','curated','dataset');
CREATE TYPE public.signal_type AS ENUM ('search_interest','news_volume','social_velocity','launch','funding','repo_velocity','review_shift','ad_volume','curated_pick');
CREATE TYPE public.trend_type AS ENUM ('consumer','startup','innovation','content','product','macro');
CREATE TYPE public.maturity_stage AS ENUM ('weak-signal','emerging','scaling','mainstream','mature','declining');
CREATE TYPE public.trend_status AS ENUM ('candidate','published','archived');
CREATE TYPE public.taxonomy_facet AS ENUM ('sector','need','geo');
CREATE TYPE public.node_status AS ENUM ('proposed','approved');
CREATE TYPE public.classification_source AS ENUM ('llm','human');
CREATE TYPE public.saved_status AS ENUM ('watching','exploring','acting','dismissed');

CREATE TABLE public.trend_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  kind public.source_kind NOT NULL,
  access_policy public.access_policy NOT NULL,
  base_url TEXT,
  rate_limit_per_min INT NOT NULL DEFAULT 10,
  robots_respected BOOLEAN NOT NULL DEFAULT true,
  license_note TEXT,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.trend_sources TO authenticated;
GRANT ALL ON public.trend_sources TO service_role;
ALTER TABLE public.trend_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read sources" ON public.trend_sources FOR SELECT TO authenticated USING (true);

CREATE TABLE public.raw_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID NOT NULL REFERENCES public.trend_sources(id) ON DELETE CASCADE,
  dedupe_key TEXT NOT NULL UNIQUE,
  external_id TEXT,
  url TEXT,
  title TEXT,
  snippet TEXT CHECK (snippet IS NULL OR char_length(snippet) <= 280),
  payload JSONB,
  access_policy_snapshot public.access_policy NOT NULL,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at TIMESTAMPTZ
);
GRANT ALL ON public.raw_signals TO service_role;
ALTER TABLE public.raw_signals ENABLE ROW LEVEL SECURITY;
CREATE INDEX raw_signals_source_idx ON public.raw_signals(source_id);

CREATE TABLE public.signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  raw_signal_id UUID REFERENCES public.raw_signals(id) ON DELETE SET NULL,
  source_id UUID NOT NULL REFERENCES public.trend_sources(id) ON DELETE CASCADE,
  signal_type public.signal_type NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  url TEXT,
  entities TEXT[] NOT NULL DEFAULT '{}',
  keywords TEXT[] NOT NULL DEFAULT '{}',
  metric_value NUMERIC,
  metric_unit TEXT,
  geo_hint TEXT,
  observed_at TIMESTAMPTZ,
  embedding vector(1536),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.signals TO authenticated;
GRANT ALL ON public.signals TO service_role;
ALTER TABLE public.signals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read signals" ON public.signals FOR SELECT TO authenticated USING (true);
CREATE INDEX signals_source_idx ON public.signals(source_id);
CREATE INDEX signals_type_idx ON public.signals(signal_type);
CREATE INDEX signals_observed_idx ON public.signals(observed_at);

CREATE TABLE public.trends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  thesis TEXT,
  description TEXT,
  trend_type public.trend_type NOT NULL,
  maturity_stage public.maturity_stage NOT NULL DEFAULT 'emerging',
  momentum_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  evidence_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  opportunity_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  signal_count INT NOT NULL DEFAULT 0,
  first_seen_at TIMESTAMPTZ,
  last_seen_at TIMESTAMPTZ,
  embedding vector(1536),
  enrichment_version TEXT,
  status public.trend_status NOT NULL DEFAULT 'candidate',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.trends TO authenticated;
GRANT ALL ON public.trends TO service_role;
ALTER TABLE public.trends ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read published trends" ON public.trends FOR SELECT TO authenticated USING (status = 'published');
CREATE INDEX trends_type_idx ON public.trends(trend_type);
CREATE INDEX trends_status_idx ON public.trends(status);
CREATE INDEX trends_momentum_idx ON public.trends(momentum_score DESC);
CREATE TRIGGER update_trends_updated_at BEFORE UPDATE ON public.trends FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.trend_signals (
  trend_id UUID NOT NULL REFERENCES public.trends(id) ON DELETE CASCADE,
  signal_id UUID NOT NULL REFERENCES public.signals(id) ON DELETE CASCADE,
  weight NUMERIC NOT NULL DEFAULT 1,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  PRIMARY KEY (trend_id, signal_id)
);
GRANT SELECT ON public.trend_signals TO authenticated;
GRANT ALL ON public.trend_signals TO service_role;
ALTER TABLE public.trend_signals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read trend_signals" ON public.trend_signals FOR SELECT TO authenticated USING (true);

CREATE TABLE public.trend_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trend_id UUID NOT NULL REFERENCES public.trends(id) ON DELETE CASCADE,
  momentum_score NUMERIC(5,2) NOT NULL,
  evidence_score NUMERIC(5,2) NOT NULL,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.trend_scores TO authenticated;
GRANT ALL ON public.trend_scores TO service_role;
ALTER TABLE public.trend_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read trend_scores" ON public.trend_scores FOR SELECT TO authenticated USING (true);
CREATE INDEX trend_scores_trend_idx ON public.trend_scores(trend_id, computed_at);

CREATE TABLE public.taxonomy_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facet public.taxonomy_facet NOT NULL,
  parent_id UUID REFERENCES public.taxonomy_nodes(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  label TEXT NOT NULL,
  description TEXT,
  status public.node_status NOT NULL DEFAULT 'proposed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (facet, key)
);
GRANT SELECT ON public.taxonomy_nodes TO authenticated;
GRANT ALL ON public.taxonomy_nodes TO service_role;
ALTER TABLE public.taxonomy_nodes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read taxonomy" ON public.taxonomy_nodes FOR SELECT TO authenticated USING (status = 'approved');

CREATE TABLE public.jtbd (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family TEXT NOT NULL,
  statement TEXT NOT NULL,
  description TEXT,
  status public.node_status NOT NULL DEFAULT 'proposed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.jtbd TO authenticated;
GRANT ALL ON public.jtbd TO service_role;
ALTER TABLE public.jtbd ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read jtbd" ON public.jtbd FOR SELECT TO authenticated USING (status = 'approved');

CREATE TABLE public.trend_taxonomy (
  trend_id UUID NOT NULL REFERENCES public.trends(id) ON DELETE CASCADE,
  node_id UUID NOT NULL REFERENCES public.taxonomy_nodes(id) ON DELETE CASCADE,
  confidence NUMERIC NOT NULL DEFAULT 1,
  source public.classification_source NOT NULL DEFAULT 'llm',
  PRIMARY KEY (trend_id, node_id)
);
GRANT SELECT ON public.trend_taxonomy TO authenticated;
GRANT ALL ON public.trend_taxonomy TO service_role;
ALTER TABLE public.trend_taxonomy ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read trend_taxonomy" ON public.trend_taxonomy FOR SELECT TO authenticated USING (true);

CREATE TABLE public.trend_jtbd (
  trend_id UUID NOT NULL REFERENCES public.trends(id) ON DELETE CASCADE,
  jtbd_id UUID NOT NULL REFERENCES public.jtbd(id) ON DELETE CASCADE,
  confidence NUMERIC NOT NULL DEFAULT 1,
  PRIMARY KEY (trend_id, jtbd_id)
);
GRANT SELECT ON public.trend_jtbd TO authenticated;
GRANT ALL ON public.trend_jtbd TO service_role;
ALTER TABLE public.trend_jtbd ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read trend_jtbd" ON public.trend_jtbd FOR SELECT TO authenticated USING (true);

CREATE TABLE public.mission_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  keywords TEXT[] NOT NULL DEFAULT '{}',
  sector_weights JSONB NOT NULL DEFAULT '{}'::jsonb,
  need_weights JSONB NOT NULL DEFAULT '{}'::jsonb,
  geo_focus TEXT[] NOT NULL DEFAULT '{}',
  embedding vector(1536),
  derived_from JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mission_profiles TO authenticated;
GRANT ALL ON public.mission_profiles TO service_role;
ALTER TABLE public.mission_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own mission" ON public.mission_profiles FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_mission_profiles_updated_at BEFORE UPDATE ON public.mission_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.saved_trends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  trend_id UUID NOT NULL REFERENCES public.trends(id) ON DELETE CASCADE,
  note TEXT,
  status public.saved_status NOT NULL DEFAULT 'watching',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, trend_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_trends TO authenticated;
GRANT ALL ON public.saved_trends TO service_role;
ALTER TABLE public.saved_trends ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own saves" ON public.saved_trends FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own saves" ON public.saved_trends FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own saves" ON public.saved_trends FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own saves" ON public.saved_trends FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.ingestion_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID NOT NULL REFERENCES public.trend_sources(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'running',
  signals_in INT NOT NULL DEFAULT 0,
  signals_kept INT NOT NULL DEFAULT 0,
  error TEXT
);
GRANT ALL ON public.ingestion_runs TO service_role;
ALTER TABLE public.ingestion_runs ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.ranked_trends_for_me(
  w_relevance NUMERIC DEFAULT 0.45,
  w_momentum NUMERIC DEFAULT 0.25,
  w_opportunity NUMERIC DEFAULT 0.20,
  w_evidence NUMERIC DEFAULT 0.10,
  max_rows INT DEFAULT 50
)
RETURNS TABLE (
  trend_id UUID,
  title TEXT,
  thesis TEXT,
  trend_type public.trend_type,
  maturity_stage public.maturity_stage,
  momentum_score NUMERIC,
  opportunity_score NUMERIC,
  evidence_score NUMERIC,
  relevance_score NUMERIC,
  match_score NUMERIC
)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public AS $$
  WITH me AS (
    SELECT embedding, geo_focus FROM public.mission_profiles WHERE user_id = auth.uid()
  ),
  scored AS (
    SELECT
      t.id, t.title, t.thesis, t.trend_type, t.maturity_stage,
      t.momentum_score, t.opportunity_score, t.evidence_score,
      CASE
        WHEN m.embedding IS NULL OR t.embedding IS NULL THEN 0::numeric
        ELSE (GREATEST(0::numeric, (1::numeric - (t.embedding <=> m.embedding)::numeric)) * 100::numeric)
      END AS relevance_score
    FROM public.trends t
    LEFT JOIN me m ON true
    WHERE t.status = 'published'
  )
  SELECT
    id, title, thesis, trend_type, maturity_stage,
    momentum_score, opportunity_score, evidence_score,
    ROUND(relevance_score::numeric, 2) AS relevance_score,
    ROUND((w_relevance * relevance_score + w_momentum * momentum_score + w_opportunity * opportunity_score + w_evidence * evidence_score)::numeric, 2) AS match_score
  FROM scored
  ORDER BY ROUND((w_relevance * relevance_score + w_momentum * momentum_score + w_opportunity * opportunity_score + w_evidence * evidence_score)::numeric, 2) DESC
  LIMIT max_rows;
$$;
GRANT EXECUTE ON FUNCTION public.ranked_trends_for_me(NUMERIC,NUMERIC,NUMERIC,NUMERIC,INT) TO authenticated;

CREATE OR REPLACE FUNCTION public.schedule_trend_ingestion(supabase_url TEXT, ingest_secret TEXT)
RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE jobid BIGINT;
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'trend-ingest-hourly') THEN
    PERFORM cron.unschedule('trend-ingest-hourly');
  END IF;
  SELECT cron.schedule(
    'trend-ingest-hourly', '0 * * * *',
    format($job$SELECT net.http_post(url := %L, headers := %L::jsonb, body := '{}'::jsonb) AS request_id;$job$,
      supabase_url || '/functions/v1/ingest?source=all',
      json_build_object('Content-Type','application/json','x-ingest-key',ingest_secret)::text)
  ) INTO jobid;
  RETURN 'scheduled job id ' || jobid::text;
END;$$;

CREATE OR REPLACE FUNCTION public.schedule_trend_enrichment(supabase_url TEXT, ingest_secret TEXT)
RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE jobid BIGINT;
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'trend-enrich-hourly') THEN
    PERFORM cron.unschedule('trend-enrich-hourly');
  END IF;
  SELECT cron.schedule(
    'trend-enrich-hourly', '30 * * * *',
    format($job$SELECT net.http_post(url := %L, headers := %L::jsonb, body := '{}'::jsonb) AS request_id;$job$,
      supabase_url || '/functions/v1/enrich',
      json_build_object('Content-Type','application/json','x-ingest-key',ingest_secret)::text)
  ) INTO jobid;
  RETURN 'scheduled job id ' || jobid::text;
END;$$;

INSERT INTO public.trend_sources (name, kind, access_policy, base_url, rate_limit_per_min, license_note) VALUES
  ('Google Trends', 'search', 'api_public', 'https://trends.google.com', 20, 'Public unofficial endpoints / pytrends'),
  ('GDELT', 'news', 'api_public', 'https://api.gdeltproject.org', 30, 'Open data project'),
  ('Reddit API', 'social', 'api_licensed', 'https://oauth.reddit.com', 30, 'Requires registered app + ToS compliance'),
  ('YouTube Data API', 'video', 'api_licensed', 'https://www.googleapis.com/youtube/v3', 30, 'API key, quota-limited'),
  ('Product Hunt', 'launch', 'api_public', 'https://api.producthunt.com', 30, 'Official GraphQL API'),
  ('GitHub', 'repo', 'api_public', 'https://api.github.com', 50, 'Official REST/GraphQL API'),
  ('Hacker News (Algolia)', 'news', 'api_public', 'https://hn.algolia.com/api', 60, 'Public search API'),
  ('Meta Ads Library', 'ads', 'api_public', 'https://www.facebook.com/ads/library', 10, 'Public ads library API'),
  ('News RSS', 'news', 'rss', NULL, 30, 'Published syndication feeds'),
  ('Springwise', 'curated', 'light_meta', 'https://www.springwise.com', 2, 'Seed/benchmark only — metadata + short snippet'),
  ('Trend Hunter', 'curated', 'light_meta', 'https://www.trendhunter.com', 2, 'Seed/benchmark only — metadata + short snippet'),
  ('Analyst notes', 'curated', 'manual', NULL, 0, 'Hand-entered themes and JTBDs');

INSERT INTO public.taxonomy_nodes (facet, key, label, description, status) VALUES
  ('need', 'connection', 'Connection', 'Belonging, relationships, community', 'approved'),
  ('need', 'meaning', 'Meaning', 'Purpose, identity, spirituality', 'approved'),
  ('need', 'health', 'Health', 'Physical, mental, emotional wellbeing', 'approved'),
  ('need', 'justice', 'Justice', 'Equity, rights, fairness, dignity', 'approved'),
  ('need', 'sustainability', 'Sustainability', 'Climate, ecology, regeneration', 'approved'),
  ('need', 'knowledge', 'Knowledge', 'Learning, education, understanding', 'approved'),
  ('need', 'beauty', 'Beauty', 'Art, expression, aesthetic experience', 'approved'),
  ('need', 'play', 'Play', 'Joy, creativity, leisure', 'approved'),
  ('sector', 'tech', 'Technology', 'Software, hardware, AI, infrastructure', 'approved'),
  ('sector', 'health_sector', 'Health & Care', 'Healthcare, biotech, mental health', 'approved'),
  ('sector', 'climate', 'Climate & Env.', 'Energy, food, materials, conservation', 'approved'),
  ('sector', 'education', 'Education', 'Schools, learning tools, training', 'approved'),
  ('sector', 'finance', 'Finance', 'Banking, fintech, investment', 'approved'),
  ('sector', 'media', 'Media & Culture', 'Content, art, journalism, entertainment', 'approved'),
  ('sector', 'civic', 'Civic & Social', 'Government, NGOs, community', 'approved'),
  ('sector', 'commerce', 'Commerce', 'Retail, services, marketplaces', 'approved'),
  ('geo', 'global', 'Global', 'Worldwide relevance', 'approved'),
  ('geo', 'mena', 'MENA', 'Middle East & North Africa', 'approved'),
  ('geo', 'gcc', 'GCC', 'Gulf Cooperation Council', 'approved'),
  ('geo', 'iraq', 'Iraq', 'Iraq-specific', 'approved'),
  ('geo', 'us', 'United States', 'US-specific', 'approved'),
  ('geo', 'eu', 'Europe', 'European market', 'approved'),
  ('geo', 'apac', 'Asia-Pacific', 'APAC region', 'approved'),
  ('geo', 'latam', 'Latin America', 'LATAM region', 'approved'),
  ('geo', 'africa', 'Africa', 'African continent', 'approved');
