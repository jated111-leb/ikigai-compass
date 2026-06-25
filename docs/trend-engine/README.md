# Ikigai Trend Engine — Design

A trend-hunting database that surfaces innovations, startups, content patterns, and
product opportunities **relevant to a user's mission** (their Ikigai output).

The engine answers two complementary questions:

| Question | Best sources | Layer |
| --- | --- | --- |
| **"What might matter?"** | Curated benchmarks (Springwise, Trend Hunter) — used as *seed/inspiration*, light metadata only | Benchmark layer |
| **"What is gaining momentum?"** | API-friendly public momentum signals (Google Trends, GDELT, Reddit, YouTube, Product Hunt, GitHub, app reviews, ads libraries, news RSS) | Signal layer |

The core idea: **triangulate public momentum signals into trends, classify them against a
shared taxonomy, then score each trend's relevance to a specific user's Ikigai.**

## Documents

1. [`01-architecture.md`](./01-architecture.md) — Safe data architecture, sources, scraping/API approach, compliance policy
2. [`02-taxonomy.md`](./02-taxonomy.md) — Structured taxonomy of trends / JTBDs / needs
3. [`03-data-model.md`](./03-data-model.md) — Entities and fields (maps 1:1 to the migration)
4. [`04-scoring.md`](./04-scoring.md) — Momentum, relevance, and opportunity scoring model

The schema lives in [`supabase/migrations/20260624000000_trend_engine.sql`](../../supabase/migrations/20260624000000_trend_engine.sql).

## Implementation status

| Piece | Where | State |
| --- | --- | --- |
| Schema + RLS + scoring RPC | `supabase/migrations/2026062400*.sql` | ✅ |
| Signal collectors (GitHub, HN, GDELT, RSS, Google Trends, Reddit, YouTube, Product Hunt) | [`supabase/functions/ingest/`](../../supabase/functions/ingest/) | ✅ keyless run now; credentialed gate on secrets |
| Mission-profile derivation (Ikigai → matchable profile) | [`src/lib/missionProfile.ts`](../../src/lib/missionProfile.ts) | ✅ |
| Personalized feed UI (`/trends`) + `ranked_signals_for_me` RPC | [`src/pages/TrendsPage.tsx`](../../src/pages/TrendsPage.tsx), `supabase/migrations/20260624020000_signal_feed.sql` | ✅ |
| Clustering signals → enriched `trends` (themes + scoring) + embedding-free `ranked_trends_for_me` | `supabase/migrations/20260624030000_trend_enrichment.sql` | ✅ |
| Scheduling (pg_cron: hourly enrichment + daily ingestion) | `supabase/migrations/20260624040000_trend_cron.sql` | ✅ |
| Embedding/LLM clustering + JTBD/need classification | — | ⏳ next layer |

> The collectors fill `signals`; `build_trends_from_signals()` clusters them into
> published `trends` by curated theme. Swapping theme-matching for embedding clusters +
> LLM taxonomy is the next layer — the table shapes don't change.

## How it connects to the existing app

The app already captures a user's mission via the Ikigai modules
(`src/data/modules/*`) and the **world-need taxonomy** (`src/data/content/world-needs.ts`).
The trend engine reuses that taxonomy as the spine for relevance scoring:

```
journeys.state (Ikigai output)  ──derive──▶  mission_profiles (keywords + sector/need weights)
                                                      │
trends ──classified-by──▶ taxonomy_nodes ◀────────────┘  relevance = overlap(mission, trend)
```

## Guiding policy (the non-negotiables)

- **Springwise / Trend Hunter** → benchmark/seed only. Store URL, title, date, category,
  public tags, one short snippet, source link. **Never** bulk-copy full article bodies,
  images, or member/paid pages. Respect `robots.txt` and Terms of Service. Pursue an
  official API / data-feed / written permission before any automation.
- **The real dataset** comes from API-accessible and openly licensed sources.
- **`robots.txt` ≠ permission.** Compliance is enforced *in the schema* via
  `trend_sources.access_policy` — the ingestion layer must check it before fetching.
