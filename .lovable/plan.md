# Trend Engine: full slice

Bringing the dormant trend engine online end-to-end. Backend first, then a minimal UI to view results.

## 1. Database

**a. Apply the existing migration** (`20260624000000_trend_engine.sql`, already in repo, 366 lines, never run). Creates: `trend_sources`, `raw_signals`, `signals`, `trends`, `trend_signals`, `trend_scores`, `taxonomy_nodes`, `jtbd`, `trend_taxonomy`, `trend_jtbd`, `mission_profiles`, `saved_trends`, `ingestion_runs`, plus `ranked_trends_for_me` RPC.

**b. Follow-up migration** adding what the docs assume but the file doesn't include:
- Enable `pg_cron` + `pg_net` extensions
- `public.schedule_trend_ingestion(supabase_url text, ingest_secret text)` — registers an hourly cron that POSTs `/functions/v1/ingest?source=all`
- `public.schedule_trend_enrichment(...)` — registers an hourly cron that POSTs `/functions/v1/enrich`
- Seed `trend_sources` rows for: Hacker News, GDELT, GitHub trending, Product Hunt, YouTube, Reddit, a couple of RSS feeds (TechCrunch, BBC tech) — each with the correct `access_policy` per `docs/trend-engine/01-architecture.md`
- Seed `taxonomy_nodes` from the existing world-needs categories already in `src/data/content/world-needs.ts` so trends can be classified against the same vocabulary the app already uses

## 2. Edge functions

**a. `supabase/functions/ingest/index.ts`**
- Auth: requires `x-ingest-key` header matching `INGEST_SECRET`
- Switch on `?source=` (or `all`)
- Per-source collector functions that honor `access_policy` from `trend_sources` (refuses to collect from `blocked`, caps `light_meta` snippets at 280 chars)
- Writes to `raw_signals` (idempotent via `dedupe_key`) then normalizes into `signals`
- Logs each run to `ingestion_runs`
- Collectors implemented: Hacker News (Algolia API, no key), GDELT (no key), GitHub trending (no key), one RSS feed, Product Hunt, YouTube Data, Reddit OAuth

**b. `supabase/functions/enrich/index.ts`**
- Pulls recent unprocessed `signals`, clusters them into `trends` (simple keyword + recency clustering for v1; embeddings deferred), then calls Lovable AI Gateway to fill `trend_taxonomy`, thesis, maturity, etc. per `docs/trend-engine/02-taxonomy.md`
- Updates `trend_scores` per `docs/trend-engine/04-scoring.md` (momentum + relevance composite)

## 3. Secrets

- `INGEST_SECRET` — generated (random, no user input)
- `YOUTUBE_API_KEY`, `PRODUCTHUNT_TOKEN`, `REDDIT_CLIENT_ID`, `REDDIT_CLIENT_SECRET` — requested from you via the secrets form
- `LOVABLE_API_KEY` already present, used by the enrich function

## 4. Frontend

**a. `/trends` route** (protected, behind existing auth)
- Lists ranked trends from `ranked_trends_for_me(auth.uid())`
- Card per trend: title, one-line thesis, momentum & relevance bars, source-count chip, "Save" toggle
- Sidebar filters: world-need category, maturity stage, geo (MENA / GCC / Iraq / Global), source policy
- Save action → `saved_trends`

**b. `/trends/saved` route** — simple list of saved trends.

**c. Mission profile** — minimal form (interests, sectors, geo) on first visit to `/trends` so `ranked_trends_for_me` has something to score against. Stored in `mission_profiles`.

**d. Header** gets a "Trends" nav link next to "Journey".

## 5. Kickoff
- Once secrets are set and migrations applied, I'll call the ingest function once manually (via the curl tool) and report what came back, then verify `/trends` renders results.

## Technical details

- Edge functions follow the in-codebase pattern (`notify-login`): Deno serve, CORS headers, `npm:@supabase/supabase-js@2`
- Migration adheres to the project's GRANT-before-RLS rule for every new public table (already correct in the existing file; will follow same pattern for any new tables)
- pg_cron jobs are inserted via the data-insert tool (not the migration tool) since they embed environment-specific URL/secret
- No changes to existing journey/auth code or `src/lib/store.ts`
- `src/integrations/supabase/types.ts` regenerates after migration approval; trend UI code is written after that so types resolve

## Order of execution

1. Apply existing trend_engine migration → wait for approval
2. Apply follow-up migration (extensions, scheduling RPCs, seed sources, seed taxonomy) → wait for approval
3. Generate `INGEST_SECRET`; request the 4 API-key secrets from you (one form, all together)
4. Write both edge functions (auto-deploy)
5. Schedule cron jobs (via insert tool) using your project URL + the secret
6. Build `/trends` UI + mission profile form + nav link
7. Trigger first ingest, verify, screenshot

## Out of scope (deferred)

- pgvector clustering (v1 uses keyword clustering)
- Springwise / Trend Hunter `light_meta` scrapers (need explicit go-ahead given ToS sensitivity)
- Alerts / email notifications when a saved-trend's momentum spikes
- Trend detail page (this slice is list + save only)
