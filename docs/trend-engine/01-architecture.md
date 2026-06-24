# 01 — Safe Data Architecture

## 1. Pipeline overview

```
┌──────────────┐   ┌───────────────┐   ┌──────────────┐   ┌───────────────┐   ┌──────────────┐
│  SOURCES     │   │  INGESTION    │   │  NORMALIZE    │   │  ENRICH (LLM) │   │  SERVE        │
│  (registry + │──▶│  collectors   │──▶│  dedupe +     │──▶│  classify +   │──▶│  search,      │
│  policy)     │   │  (per policy) │   │  cluster      │   │  score        │   │  alerts, feed │
└──────────────┘   └───────────────┘   └──────────────┘   └───────────────┘   └──────────────┘
      │ trend_sources      │ raw_signals      │ signals + trends   │ trend_taxonomy,    │ mission_profiles,
      │                    │                  │ trend_signals      │ momentum/relevance │ saved_trends
```

Each stage maps to tables in [`03-data-model.md`](./03-data-model.md). The compliance
rules from the source registry travel with every signal, so nothing downstream can
accidentally republish restricted content.

## 2. Source tiers (the four "levels of scraping", encoded)

`trend_sources.access_policy` is an enum that the ingestion layer **must** honor:

| `access_policy` | Meaning | What may be stored | Example sources |
| --- | --- | --- | --- |
| `api_licensed` | Official API / paid feed / written permission | Whatever the license grants | YouTube Data API, Crunchbase (licensed), Reddit API |
| `api_public` | Public, ToS-friendly API or open dataset | Full per the API terms | Google Trends, GDELT, Product Hunt, GitHub, Hacker News, Meta/TikTok ad libraries |
| `rss` | Published feed meant for syndication | Title, link, date, summary | News RSS, blog RSS |
| `light_meta` | Public HTML, ToS-permitting, **metadata only** | URL, title, date, category, public tags, ≤1 short snippet, source link | Springwise, Trend Hunter |
| `manual` | Analyst enters by hand | Notes, themes, taxonomy | Curated benchmark reads |
| `blocked` | Disallowed by ToS/robots/paywall | **Nothing** — ingestion refuses | member/paid pages |

The collector is a thin switch on this value. For `light_meta`, a hard cap
(`snippet ≤ 280 chars`, no body, no image bytes) is enforced before insert. For
`blocked`, the collector returns early and logs. This makes the policy auditable in SQL,
not buried in code comments.

> **Rule baked into the model:** Springwise & Trend Hunter are seeded as `light_meta`.
> Promote to `api_licensed` only after a real data-feed agreement, then their policy row
> changes and richer storage unlocks — no code change needed.

## 3. Sources by intent

### "What is gaining momentum?" — the real dataset (prefer these)

| Source | Policy | Signals it provides | Trend type |
| --- | --- | --- | --- |
| Google Trends | `api_public` | Search interest over time, breakout queries, geo | consumer |
| GDELT | `api_public` | Global news volume/tone by theme, geo | consumer / macro |
| Reddit API | `api_licensed` | Subreddit growth, post velocity, sentiment | consumer / content |
| YouTube Data API | `api_licensed` | View velocity, topic clusters | content |
| TikTok Creative Center / Ads Library | `api_public` | Trending hashtags, sounds, creatives | content |
| Meta Ads Library | `api_public` | Active ad volume per advertiser/theme | product / content |
| Product Hunt | `api_public` | New launches, upvote velocity | startup / product |
| GitHub | `api_public` | Repo stars velocity, new-project topics | startup / dev tooling |
| Hacker News (Algolia API) | `api_public` | Story/comment velocity | startup / dev |
| App Store / Play reviews | `api_public` | Rating shifts, feature requests, complaints | product |
| Crunchbase / Dealroom / Tracxn | `api_licensed` | Funding rounds, new entrants | startup |
| News RSS feeds | `rss` | Coverage volume per theme | consumer / macro |
| Public datasets (Kaggle, gov, World Bank) | `api_public` | Macro context, demand baselines | macro |

### "What might matter?" — curated benchmarks (seed/inspiration only)

| Source | Policy | Use |
| --- | --- | --- |
| Springwise | `light_meta` → `api_licensed` if licensed | Theme/keyword/taxonomy seeds; benchmark "is this on the radar of curators?" |
| Trend Hunter | `light_meta` → `api_licensed` if licensed | Same; tag vocabulary mining |
| Analyst reads | `manual` | Hand-entered themes, JTBDs |

## 4. Ingestion approach

- **Cadence:** signal collectors run on schedule (Supabase Edge Function + cron, or an
  external worker). Light-meta sources run **low-frequency** (e.g. daily, ≤1 req/few-sec,
  honoring `robots.txt` crawl-delay).
- **Idempotency:** every signal carries a deterministic `dedupe_key`
  (`source_id + external_id` or `sha256(url)`). Re-runs upsert, never duplicate.
- **Provenance:** every signal stores `source_id`, `source_url`, `fetched_at`, and the
  `access_policy` snapshot so we can prove how each datum was obtained.
- **Backpressure / politeness:** per-source rate limits live in
  `trend_sources.rate_limit_per_min`; the collector self-throttles.
- **Failure handling:** collectors write to `ingestion_runs` (status, counts, errors) for
  observability.

## 5. Normalization & clustering

1. **Normalize** each raw signal into the `signals` table (canonical fields).
2. **Cluster** related signals into a `trends` row using embedding similarity +
   keyword/entity overlap. A trend is the durable object; signals are its evidence.
3. **Link** via `trend_signals`, which also stores the per-signal contribution weight.

This is the step that converts noisy multi-source signals into the "trends" users browse.

## 6. LLM enrichment

A classification pass (see [`02-taxonomy.md`](./02-taxonomy.md)) fills, per trend:

- trend theme & one-line thesis
- consumer need / JTBD
- sector(s) and world-need category (reusing the app's existing taxonomy)
- geography (with explicit MENA / Iraq / GCC tagging)
- maturity stage (emerging → scaling → mainstream → declining)
- evidence strength
- commercial-opportunity hypothesis

Outputs are written to `trend_taxonomy`, `trend_jtbd`, and the score columns. Prompts are
versioned (`enrichment_version`) so re-classification is reproducible.

## 7. Serving layer

- **Search / browse:** Postgres full-text + `pgvector` similarity over `trends`.
- **Personalized feed:** join `trends` to a user's `mission_profiles` and rank by the
  composite score in [`04-scoring.md`](./04-scoring.md).
- **Alerts:** when a trend matching a user's mission crosses a momentum threshold, notify
  (reuse the existing `notify-login` Edge Function pattern).
- **Saves / boards:** `saved_trends` lets users curate their own shortlists.

## 8. Security & RLS posture

- **Public-read, service-write** for the curated knowledge (`trends`, `signals`,
  `taxonomy_nodes`, …): anyone signed in can read; only the service role (ingestion) writes.
- **User-owned** for personal data (`mission_profiles`, `saved_trends`): RLS restricts to
  `auth.uid()`, mirroring the existing `journeys`/`profiles` policies.
- Source API keys live in Edge Function secrets / Vault, **never** in client code or the DB.
