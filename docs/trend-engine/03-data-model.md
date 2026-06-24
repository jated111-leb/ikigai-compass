# 03 — Data Model (Fields)

Maps 1:1 to [`supabase/migrations/20260624000000_trend_engine.sql`](../../supabase/migrations/20260624000000_trend_engine.sql).
All tables are `public` schema, RLS enabled.

## Entity-relationship summary

```
trend_sources ─1───∞─ raw_signals ─(normalize)─▶ signals ─∞──∞─ trends
      │                                                │  (trend_signals)  │
      │                                                │                   ├─∞─ trend_taxonomy ─∞─ taxonomy_nodes
      └─ access_policy governs storage                 │                   ├─∞─ trend_jtbd ─∞─ jtbd
                                                        │                   └─∞─ trend_scores (history)
profiles ─1──1─ mission_profiles ─(scored against)─▶ trends ─∞──∞─ saved_trends ─∞─1─ profiles
ingestion_runs  (observability)
```

## Tables & key fields

### `trend_sources` — registry + compliance
| Field | Type | Notes |
| --- | --- | --- |
| `id` | uuid PK | |
| `name` | text | "Google Trends", "Springwise" |
| `kind` | enum `source_kind` | `search`, `news`, `social`, `video`, `funding`, `launch`, `repo`, `reviews`, `ads`, `curated`, `dataset` |
| `access_policy` | enum `access_policy` | `api_licensed` / `api_public` / `rss` / `light_meta` / `manual` / `blocked` |
| `base_url` | text | |
| `rate_limit_per_min` | int | collector self-throttles |
| `robots_respected` | bool | must be true unless licensed |
| `license_note` | text | what permission we hold |
| `enabled` | bool | |

### `raw_signals` — landing zone (provenance-first)
| Field | Type | Notes |
| --- | --- | --- |
| `id` | uuid PK | |
| `source_id` | uuid FK → trend_sources | |
| `dedupe_key` | text UNIQUE | `source + external_id` or `sha256(url)` |
| `external_id` | text | id at the source |
| `url` | text | |
| `title` | text | |
| `snippet` | text | **CHECK length ≤ 280** (enforces light-meta cap) |
| `payload` | jsonb | raw, only for `api_*` policies |
| `access_policy_snapshot` | enum | policy at fetch time |
| `fetched_at` | timestamptz | |
| `published_at` | timestamptz | |

### `signals` — normalized evidence
| Field | Type | Notes |
| --- | --- | --- |
| `id` | uuid PK | |
| `raw_signal_id` | uuid FK | |
| `source_id` | uuid FK | denormalized for fast filter |
| `signal_type` | enum | `search_interest`, `news_volume`, `social_velocity`, `launch`, `funding`, `repo_velocity`, `review_shift`, `ad_volume`, `curated_pick` |
| `title` | text | |
| `summary` | text | short, derived |
| `url` | text | |
| `entities` | text[] | extracted orgs/people/products |
| `keywords` | text[] | |
| `metric_value` | numeric | e.g. interest index, upvotes, stars |
| `metric_unit` | text | |
| `geo_hint` | text | |
| `observed_at` | timestamptz | when the metric pertains to |
| `embedding` | vector(1536) | for clustering & search (pgvector) |

### `trends` — the durable, browsable object
| Field | Type | Notes |
| --- | --- | --- |
| `id` | uuid PK | |
| `slug` | text UNIQUE | |
| `title` | text | |
| `thesis` | text | one-line "why this matters" |
| `description` | text | |
| `trend_type` | enum | `consumer`/`startup`/`innovation`/`content`/`product`/`macro` |
| `maturity_stage` | enum | `weak-signal`…`declining` |
| `momentum_score` | numeric(5,2) | 0–100, see scoring |
| `evidence_score` | numeric(5,2) | 0–100 |
| `opportunity_score` | numeric(5,2) | 0–100 |
| `first_seen_at` / `last_seen_at` | timestamptz | |
| `signal_count` | int | maintained by trigger/job |
| `embedding` | vector(1536) | |
| `enrichment_version` | text | reproducibility |
| `status` | enum | `candidate`/`published`/`archived` |

### `trend_signals` — evidence join
`trend_id`, `signal_id` (PK pair), `weight` numeric, `is_primary` bool.

### `taxonomy_nodes` — faceted hierarchy
| Field | Type | Notes |
| --- | --- | --- |
| `id` | uuid PK | |
| `facet` | enum `taxonomy_facet` | `sector`/`need`/`geo` |
| `parent_id` | uuid FK self | null = root |
| `key` | text | stable slug, e.g. `mena`, `sustainable-world` |
| `label` | text | |
| `description` | text | |
| `status` | enum | `proposed`/`approved` (human gate) |
| UNIQUE(`facet`,`key`) | | |

### `jtbd` — jobs to be done
`id`, `family` (text), `statement` (the canonical When/I want/so I can), `description`,
`status`.

### `trend_taxonomy` — trend ↔ node
`trend_id`, `node_id` (PK pair), `confidence` numeric, `source` enum (`llm`/`human`).

### `trend_jtbd` — trend ↔ jtbd
`trend_id`, `jtbd_id` (PK pair), `confidence` numeric.

### `mission_profiles` — the user's Ikigai, made matchable (USER-OWNED)
| Field | Type | Notes |
| --- | --- | --- |
| `id` | uuid PK | |
| `user_id` | uuid FK → profiles, UNIQUE | one per user |
| `keywords` | text[] | extracted from `journeys.state` |
| `sector_weights` | jsonb | `{ "sustainable-world": 0.8, ... }` |
| `need_weights` | jsonb | |
| `geo_focus` | text[] | e.g. `['iraq','mena']` |
| `embedding` | vector(1536) | mission vector for similarity |
| `derived_from` | jsonb | which modules/answers fed it (audit) |
| `updated_at` | timestamptz | |

### `saved_trends` — user shortlists (USER-OWNED)
`id`, `user_id` FK, `trend_id` FK, `note` text, `status` enum
(`watching`/`exploring`/`acting`/`dismissed`), `created_at`. UNIQUE(user_id, trend_id).

### `trend_scores` — score history (optional, for trend-of-trends)
`id`, `trend_id` FK, `momentum_score`, `evidence_score`, `computed_at`. Lets you chart a
trend's acceleration over time.

### `ingestion_runs` — observability
`id`, `source_id` FK, `started_at`, `finished_at`, `status`, `signals_in`, `signals_kept`,
`error`.

## RLS summary

| Table group | SELECT | INSERT/UPDATE/DELETE |
| --- | --- | --- |
| Knowledge: `trend_sources`*, `signals`, `trends`, `trend_signals`, `taxonomy_nodes`, `jtbd`, `trend_taxonomy`, `trend_jtbd`, `trend_scores` | any authenticated user (published rows) | `service_role` only |
| Personal: `mission_profiles`, `saved_trends` | `auth.uid() = user_id` | `auth.uid() = user_id` |
| Internal: `raw_signals`, `ingestion_runs` | `service_role` only | `service_role` only |

\* `trend_sources` is readable so the UI can show provenance; API keys are **not** stored here.
