# `ingest` — trend-engine signal collectors

Pulls momentum signals from the sources in the trend-engine design and writes
them to `raw_signals` + `signals` (idempotently). Each source is a collector
module under `collectors/`; the router in `index.ts` runs them and records an
`ingestion_runs` row per source.

## Sources

| Collector | Source | Credentials | Notes |
| --- | --- | --- | --- |
| `github` | GitHub | optional `GITHUB_TOKEN` | Runs keyless; token raises rate limit |
| `hackernews` | HN (Algolia) | none | |
| `gdelt` | GDELT | none | Global news coverage |
| `rss` | News RSS | none | Feeds via `RSS_FEEDS` (comma-sep) |
| `googletrends` | Google Trends | none | Daily-trends RSS; regions via `GOOGLE_TRENDS_GEO` |
| `reddit` | Reddit | optional `REDDIT_CLIENT_ID`/`REDDIT_CLIENT_SECRET` | OAuth when set; subs via `REDDIT_SUBREDDITS` |
| `youtube` | YouTube Data API | **required** `YOUTUBE_API_KEY` | Skipped if unset |
| `producthunt` | Product Hunt | **required** `PRODUCTHUNT_TOKEN` | Skipped if unset |

TikTok and the Meta Ads Library are intentionally **not** collectors — they
have no stable server-side API and would require fragile scraping, contrary to
the compliance posture in `docs/trend-engine/`. They remain `manual`/licensed
sources in the registry.

## Invoke

```sh
# all sources, last 7 days
curl -X POST "$SUPABASE_URL/functions/v1/ingest?source=all&lookback=7&limit=15" \
  -H "x-ingest-key: $INGEST_SECRET"

# a single source with custom topics
curl "$SUPABASE_URL/functions/v1/ingest?source=github&topics=climate%20tech,fintech"
```

Query params: `source` (`all` or comma-separated collector keys), `lookback`
(days, default 7), `limit` (items per topic, default 15), `topics`
(comma-separated; defaults to the seed list in `lib/queries.ts`).

## Secrets

Set with the Supabase CLI, e.g.:

```sh
supabase secrets set INGEST_SECRET=... YOUTUBE_API_KEY=... PRODUCTHUNT_TOKEN=...
```

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are injected automatically in the
Edge runtime.

## Schedule

Trigger on a schedule with `pg_cron` (or any external scheduler) hitting the
endpoint with the `x-ingest-key` header. A daily `source=all` pull is a
reasonable default; raise frequency for fast-moving sources as needed.

## Deploy

```sh
supabase functions deploy ingest
```

## Next layer

These collectors fill `signals`. Clustering signals into enriched `trends`
(embeddings + LLM taxonomy/scoring) is the next stage; until then the app's
Trends page ranks signals directly via the `ranked_signals_for_me` RPC.
