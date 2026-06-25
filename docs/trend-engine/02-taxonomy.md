# 02 — Trend / JTBD / Need Taxonomy

A trend is described along **independent facets**, not one rigid tree. Each facet is a set
of `taxonomy_nodes` (a self-referencing hierarchy), so a trend can carry one node from
several facets at once (e.g. *consumer* × *health* × *Europe* × *emerging*).

## Facets

### Facet A — Trend type (the lens)
What kind of trend this is. Drives which sources are most credible.

- `consumer` — shifts in what people want/do/believe
- `startup` — new ventures, business models, funding patterns
- `innovation` — technologies, R&D, novel solutions (Springwise/Trend Hunter territory)
- `content` — formats, narratives, creators, platform behaviors
- `product` — concrete product/feature opportunities & gaps
- `macro` — economic, demographic, regulatory, environmental backdrop

### Facet B — Sector / domain
Reuses and extends the app's existing **world-need categories**
(`src/data/content/world-needs.ts`) so trends and missions share one vocabulary:

- `beautiful-world` (arts, culture, design, craft…)
- `compassionate-world` (care, inclusion, mental health…)
- `sustainable-world` (climate, energy, food, circularity…)
- `just-world` (governance, rights, transparency…)
- `prosperous-world` (work, education, finance, access…)

…plus pragmatic commercial sectors that the world-need frame doesn't cover:
`health`, `fintech`, `commerce`, `mobility`, `proptech`, `enterprise-saas`,
`dev-tools`, `media-entertainment`, `food-bev`, `edtech`, `agritech`, `deeptech`.

### Facet C — Job-To-Be-Done (JTBD)
The functional/emotional/social progress a person is trying to make. Stored in `jtbd`
and linked via `trend_jtbd`. Written in canonical JTBD form:

> *When [situation], I want to [motivation], so I can [expected outcome].*

JTBD families (top level), each expandable:
- `get-healthier`, `feel-belonging`, `save-time`, `save-money`, `learn-grow`,
  `express-identity`, `stay-safe`, `be-entertained`, `do-good`, `gain-status`,
  `manage-complexity`, `access-the-inaccessible`.

### Facet D — Consumer need (Maslow-ish, durable)
The underlying human need a trend taps. Slower-moving than JTBD.
- `physiological`, `safety`, `belonging`, `esteem`, `self-actualization`,
  `meaning-purpose`, `convenience`, `autonomy`, `novelty`, `connection`.

### Facet E — Geography
- World regions → countries. This is a **global** app: no region is privileged. A
  region focus (if the user expresses one) drives an even-handed relevance bonus in
  scoring (see [`04-scoring.md`](./04-scoring.md)).
- `global`, `africa`, `asia`, `europe`, `north-america`, `south-america`, `oceania`,
  `middle-east`, expandable to countries.

### Facet F — Maturity stage
Where the trend sits on the adoption curve.
- `weak-signal` → `emerging` → `scaling` → `mainstream` → `mature` → `declining`

### Facet G — Evidence strength (quality, not a category)
Stored as a numeric on the trend, derived during scoring:
- count & diversity of independent sources, recency, momentum slope, source credibility.

## Facet → table mapping

| Facet | Where it lives |
| --- | --- |
| A Trend type | `trends.trend_type` (enum) |
| B Sector / domain | `taxonomy_nodes` (facet=`sector`) ↔ `trend_taxonomy` |
| C JTBD | `jtbd` ↔ `trend_jtbd` |
| D Consumer need | `taxonomy_nodes` (facet=`need`) ↔ `trend_taxonomy` |
| E Geography | `taxonomy_nodes` (facet=`geo`) ↔ `trend_taxonomy` |
| F Maturity | `trends.maturity_stage` (enum) |
| G Evidence strength | `trends.evidence_score` (numeric) |

## Why facets, not one tree

A single hierarchy forces false choices ("is a vertical-farming startup a
*sustainability* trend or a *startup* trend or a *regional* trend?"). Facets let it be all
of them, which is exactly what makes relevance scoring against a user's multi-dimensional
Ikigai possible.

## Seeding the taxonomy

1. Import the five world-need categories + subtopics from `world-needs.ts` as the initial
   `sector` facet nodes (keeps app and engine in sync).
2. Mine **tag vocabularies** from Springwise / Trend Hunter (`light_meta`) to suggest new
   leaf nodes — but a human approves before they enter the canonical taxonomy
   (`taxonomy_nodes.status = 'approved'`).
3. JTBD and need facets are seeded from the lists above and grown from LLM extraction over
   real signals, again gated by `status`.
