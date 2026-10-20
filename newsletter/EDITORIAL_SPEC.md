# Editorial Spec — The Daily Compass

This is the runbook the daily agent follows. Format, voice, and the morning procedure.

## Issue template

```
Subject: The Daily Compass #NNN — <the day's sharpest hook, ≤8 words>

<2–3 sentence cold open: the day's throughline, written with a point of view.>

── THE BRIEFS ────────────────────────────────
Three items, ~250–350 words each. Briefs are idea-led, not news-led (per the
2026-07-16 feedback): at most ONE brief may be driven by the AI news cycle, and
only when genuinely consequential. The other two lead with an essay, a strategy
framework, a philosophical question, or history that reframes the present —
fresh publication date optional. Anatomy of a brief:
  ◆ Hook title (not the source's headline — ours)
  • WHAT HAPPENED — 2–3 sentences, concrete.
  • THE EXCERPT — optional; a short quote in the source's own voice, used only
    when its exact wording is verified (full-text scraping is unavailable).
  • WHY IT MATTERS — 3–5 sentences of analysis keyed to Jad's
    strategy lenses (see PREFERENCES.md); connect across pillars when
    the connection is real.
  • Source: Author, Publication — link. Read time.

── RAPID FIRE ────────────────────────────────
6–8 items, one per line:
  **Bolded mini-hook** — one sentence of what + why. (Author, Source, link)
Mix across pillars. At least one TIMELESS pick, flagged ⏳, with a line on
why it surfaced today. At most one wildcard 🃏 from outside the register.

── THE QUEUE ─────────────────────────────────
2–3 podcast episodes:
  **Show — guest/episode** (duration)
  Two sentences: what it covers, and an honest verdict — "queue it",
  "skim the transcript", or "skippable unless you care about X".

── CODA ──────────────────────────────────────
One closing thought, quote, or question. ≤3 sentences. The 3QD touch —
something that lingers.

Reply to this email with feedback — it changes tomorrow's issue.
```

## Voice

- Write like a brilliant chief-of-staff who reads everything and respects the reader's
  time: direct, opinionated, never breathless.
- Excerpts carry the source's voice; analysis carries ours. Keep them visually distinct.
- Verdicts over hedges. "This matters because X" beats "this may be interesting."
- Humor allowed, exclamation points rationed, emoji only the two flags above.
- 15–20 minute total read. Roughly 1,800–2,400 words.

## Morning procedure (the routine's checklist)

1. `git fetch` and read newsletter/PREFERENCES.md (including feedback log),
   newsletter/SOURCES.md, and the last 7 files in newsletter/issues/.
2. HARVEST (updated 2026-10-20): run 4 parallel background agents — AI / strategy
   core / venture+growth+leadership / futurism+podcasts+coda — using WebSearch only
   (direct HTTP is blocked; the Apify-via-Zapier scraper is retired; never Nimble).
   Give each agent the dedupe list and a budget: ~20 searches, a ranked report of
   ≤700 words with title/author/outlet/date/URL and verified specifics. If agents fail
   on a usage limit, do not stall: research directly with ~10–15 targeted searches
   and ship a thinner honest issue. Re-verify every key fact and URL yourself before
   it goes in.
3. CURATE: score against preferences; enforce standing rules (dedupe vs last 14 issues,
   ~40/60 fresh/timeless per PREFERENCES.md, all-pillar coverage unless a pillar is genuinely quiet).
4. COMPOSE per the template above. Write the briefs from the actual source text
   (via search results and abstracts), never from a headline alone. Paraphrase
   and credit; quote only short passages whose exact wording you have verified.
   Verify every URL resolves.
5. DELIVER: send via Zapier Gmail `message` action (HTML body) to all recipients in
   PREFERENCES.md (currently jamousjad@gmail.com, ahmed.oudah@1001.tv,
   bashar.kadhim@1001.tv — one send, all in the `to` list).
   Fallback if send fails: create a Gmail draft via the direct connector and flag it.
   After sending, confirm it landed with an `in:sent` search for the subject; a
   timeout is not a failure, so check before any retry to avoid duplicates.
6. ARCHIVE: write the issue to newsletter/issues/YYYY-MM-DD-issue-NNN.md, commit, push.
7. If the mailbox/chat contains new feedback since the last issue: append it to the
   PREFERENCES.md feedback log (dated) before composing, and honor it immediately.

## Failure etiquette

- A thin news day → a shorter honest issue, never padding.
- A source repeatedly unreachable → note it in SOURCES.md changelog.
- Anything broken → the email still goes out, with a one-line "editor's note" on what's
  missing. Silence is the only unacceptable failure mode.
