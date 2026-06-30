# `enrich` — cluster signals into trends + Haiku Batch enrichment

Clusters recent `signals` into `trends`, then enriches each **changed** trend with
**Claude Haiku 4.5** via the **Anthropic Batch API** (50% off), using **structured
outputs** (guaranteed JSON schema) and **prompt caching** on the shared system prefix.

## Two phases (the Batch API is async)

| Call | What it does |
| --- | --- |
| `POST /enrich?action=cluster` | Cluster orphan signals (last 14 days) by shared keyword → create new trends / refresh existing scores → **submit one Haiku batch** for trends that are new or whose signal set grew materially. Records the batch in `enrichment_batches` / `enrichment_items`. |
| `POST /enrich?action=collect` | Poll pending batches. When a batch has `ended`, fetch results and apply each: title, thesis, description, trend_type, maturity, **need/sector/geo** taxonomy links, and a **JTBD**. Idempotent — safe to call repeatedly. |

Auth: both require the `x-ingest-key` header matching `INGEST_SECRET`.

## Cost controls (per your plan)

- **Classify trends, not signals** — one Haiku call per *cluster*, not per signal.
- **Skip-unchanged** — a trend is only (re-)enriched when `signal_count` grows ≥50% or by ≥5 since its last enrichment (`trends.enrichment_signature`).
- **Batch API** — 50% off vs. synchronous.
- **Prompt caching** — the taxonomy/system prompt is identical across every request in a batch, so all but the first read it from cache (~0.1×).
- **Structured outputs** — `output_config.format` with a JSON schema whose enums match the `taxonomy_nodes` keys, so links always resolve and bad output can't be inserted.

At weekly cadence this is a few dollars/month or less.

## Schedule (weekly)

`supabase/migrations/20260625180000_trend_weekly_enrichment.sql` sets it up. After deploy, register the cron jobs once:

```sql
select public.schedule_trend_ingestion('https://<ref>.supabase.co', '<INGEST_SECRET>');
select public.schedule_trend_enrichment('https://<ref>.supabase.co', '<INGEST_SECRET>');
```

- `trend-ingest-weekly` — Mondays 05:00 UTC
- `trend-enrich-weekly` — Mondays 06:00 UTC (`action=cluster`)
- `trend-enrich-collect` — hourly (`action=collect`, no-op when nothing is pending)

## Secrets

```sh
supabase secrets set INGEST_SECRET=... ANTHROPIC_API_KEY=...
```

`SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` are injected automatically. Without
`ANTHROPIC_API_KEY`, `cluster` still creates trends (with placeholder titles) and just
skips the LLM batch.

## Deploy

```sh
supabase functions deploy enrich
```
