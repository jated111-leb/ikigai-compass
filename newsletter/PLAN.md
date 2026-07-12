# The Daily Compass — a 3QD-style intelligence brief for Jad

A human-quality, editorially curated daily newsletter covering **AI, strategy, futurism,
and podcasts** — modeled on the editorial DNA of [3 Quarks Daily](https://3quarksdaily.com),
rebuilt around one reader's interests and delivered by an autonomous agent every morning.

## What we reverse-engineered from 3 Quarks Daily

1. **Cadence**: ~a dozen items/day, Tue–Sun; Monday is an all-original "Monday Magazine."
2. **Item anatomy**: hook title → image → *long pull-quote in the source's own voice*
   (not a summary) → "More here" link. Attribution to author + publication.
3. **Source philosophy**: a deliberate high/low mix — legacy institutions (NYRB, New Yorker)
   beside individual Substacks, YouTube lectures, and university presses. Individual
   *thinkers* matter as much as publications.
4. **Editorial stance**: "No algorithms — just six human editors." Selection *is* the
   commentary. Interestingness beats recency; a great 2019 essay can run today.
5. **The economics of trust**: no clickbait, no filler. If a day is thin, the issue is thin.

## What we're building (differences from 3QD)

| Dimension | 3QD | The Daily Compass |
|---|---|---|
| Audience | general intellectual public | one reader (Jad) |
| Beats | everything | AI · strategy (4 lenses) · futurism · podcasts |
| Format | flat list of ~12 items | **hybrid brief**: 3 deep briefs → rapid-fire links → podcast queue |
| Voice | pure excerpt, minimal commentary | excerpt **plus** analysis: why it matters, how it connects |
| Freshness | timeless-first | 70% last-48h / 30% timeless |
| Editor | six humans | one agent + a preferences file that learns from feedback |

## Architecture (agent pipeline, no servers)

```
                 ┌────────────────────────────────────────────┐
  6:00 Beirut ──▶│ Scheduled Routine (fresh Claude session)   │
                 └────────────────────────────────────────────┘
                    │ 1. HARVEST   Apify scrape + web search across
                    │              newsletter/SOURCES.md (~40 candidates)
                    │ 2. CURATE    score vs newsletter/PREFERENCES.md;
                    │              dedupe vs recent issues; pick winners
                    │ 3. COMPOSE   per newsletter/EDITORIAL_SPEC.md
                    │ 4. DELIVER   Gmail → jamousjad@gmail.com
                    │ 5. ARCHIVE   commit issue to newsletter/issues/
                    ▼
              feedback (email replies / chat) ──▶ PREFERENCES.md updates
```

- **Harvest** uses Apify (via the Zapier connector's `Scrape Single URL` action — verified
  working in this environment; direct fetches are blocked by network policy) plus
  server-side web search for discovery.
- **Curate** enforces the kill-rules and quotas in EDITORIAL_SPEC.md and checks the last
  ~7 issues in `newsletter/issues/` so nothing repeats.
- **Deliver** sends via Gmail (Zapier Gmail `message` action once authorized; until then,
  a draft via the direct Gmail connector).
- **Learn**: every piece of reader feedback becomes a dated line in PREFERENCES.md's
  feedback log; the curation step reads it every morning.

## Delivery decisions (confirmed with Jad, 2026-07-12)

- **Channel**: email to jamousjad@gmail.com
- **Schedule**: daily, ~6:00 AM Beirut time (cron `0 3 * * *` UTC during EEST; shift to
  `0 4 * * *` when Lebanon leaves summer time)
- **Format**: hybrid intelligence brief, 15–20 min read (rich variant)
- **Podcasts**: why-listen blurbs (guest, topic, 2-sentence verdict)
- **Recency**: 70% fresh / 30% timeless
- **Strategy lenses**: business & tech, geopolitics & grand strategy, decision-making &
  mental models, personal strategy & career — all four

## Rollout

1. ✅ Plan, sources, preferences, editorial spec committed (this commit)
2. ✅ Test issue #001 generated with real content and delivered for review
3. ⬜ Jad authorizes Zapier Gmail send (one click) so issues arrive in the inbox unattended
4. ⬜ Feedback on issue #001 folded into PREFERENCES.md
5. ⬜ Daily Routine activated (6:00 Beirut, fresh session per issue)
6. ⬜ Later, optional: web archive page inside ikigai-compass; weekly "Monday deep-dive"
   original essay; automatic podcast transcript summaries
