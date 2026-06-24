# 04 — Scoring Model

Three scores, computed in two passes:

1. **Trend-intrinsic** (same for everyone): `momentum`, `evidence`, `opportunity`.
2. **User-specific** (per mission): `relevance`, then a final `match` ranking.

All scores are normalized to **0–100** for display.

## 1. Momentum — "what is gaining, how fast"

Captures growth, not just volume. For a trend with signals over time:

```
momentum = 100 * sigmoid(
      0.45 * z(acceleration)     # slope of signal metric over last N days (2nd-order matters most)
    + 0.25 * z(recency_weighted_volume)
    + 0.20 * z(source_diversity) # distinct sources/types showing it
    + 0.10 * z(breakout_flag)    # any source flags it as "breakout"/"new"
)
```

- `acceleration` is the dominant term — a trend "gaining momentum" is about the **slope**,
  not the absolute level. A high-volume but flat topic scores lower than a small but
  sharply accelerating one.
- `recency_weighted_volume` uses exponential decay (half-life ~14 days) so stale spikes fade.
- Store snapshots in `trend_scores` so you can compute acceleration and show a sparkline.

## 2. Evidence — "how much should I trust this"

```
evidence = 100 * sigmoid(
      0.40 * z(independent_source_count)   # distinct sources, not distinct articles
    + 0.30 * z(source_credibility_avg)     # per-source weight (api_licensed > curated > rss > light_meta)
    + 0.20 * z(corroboration)              # do different signal_types agree?
    + 0.10 * z(span_days)                  # sustained over time, not a one-day blip
)
```

Source credibility ties back to `access_policy`: licensed/API data is more trustworthy than
a single scraped snippet. Curated picks (Springwise/Trend Hunter) count as **strong
corroboration of "what might matter"** but weak evidence of momentum on their own — they're
editorial, not behavioral.

## 3. Opportunity — "is there room to build"

A coarse, transparent heuristic (don't over-engineer; it's a prioritization nudge):

```
opportunity = 100 * sigmoid(
      0.35 * z(demand_signal)       # consumer/search/review demand present
    - 0.25 * z(saturation)          # many incumbents / high ad_volume / mainstream maturity ⇒ less room
    + 0.20 * z(funding_velocity)    # capital flowing in = validated but also competitive
    + 0.20 * z(whitespace_geo)      # demand exists but few local players (esp. MENA/Iraq/GCC)
)
```

`whitespace_geo` is what makes this useful for a MENA-focused founder: a trend that's
mainstream globally but absent locally is a high-opportunity *transfer* play.

## 4. Relevance — "does this fit THIS user's mission"

Computed per `(trend, mission_profile)`. This is where the Ikigai connection lives.

```
relevance = 100 * (
      0.45 * cosine(trend.embedding, mission.embedding)     # semantic fit to the whole mission
    + 0.25 * facet_overlap(sector_weights)                  # weighted overlap on sector facet
    + 0.15 * facet_overlap(need_weights)                    # weighted overlap on need facet
    + 0.10 * jtbd_overlap                                   # shared jobs-to-be-done
    + 0.05 * keyword_overlap(jaccard)                       # cheap lexical backstop
)
```

`facet_overlap(weights)` = Σ over shared nodes of `min(mission_weight, trend_confidence)`,
normalized. Because `sector_weights`/`need_weights` come straight from the user's Ikigai
answers, a "sustainability + community" person and a "fintech + status" person see very
different top trends from the same database.

### Geo bonus
If the trend's `geo` nodes intersect `mission.geo_focus` (e.g. user focuses on Iraq and the
trend is tagged `mena`/`iraq`), add a bounded bonus:
`relevance = min(100, relevance + 12 * geo_match_strength)`.

## 5. Final match ranking (the feed)

What the personalized feed sorts on:

```
match = w_r * relevance
      + w_m * momentum
      + w_o * opportunity
      + w_e * evidence
      - freshness_penalty(last_seen_at)
```

Default weights (`w_r=0.45, w_m=0.25, w_o=0.20, w_e=0.10`) make **relevance the primary
axis** — the product promise is "innovations related to *your* mission," not a generic
trending list. Weights are config, surfaced as UI controls ("show me more emerging vs.
proven", "prioritize local opportunity").

### Guardrails
- **Cold start:** if a user has no `mission_profile` yet (hasn't finished the Ikigai
  journey), fall back to `0.6*momentum + 0.4*opportunity` and prompt them to complete it.
- **Diversity:** apply max-marginal-relevance so the feed isn't 10 near-duplicate AI trends.
- **Explainability:** persist the component scores, so each card can say *"High match:
  strong fit to your sustainability focus · accelerating · early stage · local whitespace."*
  Trust comes from showing the why.

## 6. Where it's computed

- Intrinsic scores: in the LLM-enrichment / scoring job (Edge Function or worker), written
  to `trends.*_score` and snapshotted to `trend_scores`.
- Relevance & match: at query time via a Postgres function / RPC joining `trends` to the
  caller's `mission_profiles` (pgvector for the cosine term), so it always reflects the
  user's latest Ikigai state.
