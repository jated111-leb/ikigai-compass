# Ikigai Compass

A guided reflective journey that helps students find their direction — the place where
what they love, what they're good at, what the world needs, and what they can build a life
around meet.

Ikigai (生き甲斐) is a Japanese idea about what makes life feel worth living. The four-circle
framework used here is a modern, Western adaptation — a practical lens for finding direction,
not a claim to the whole tradition.

## What it is

Six modules of guided reflection, each paired with an AI coach that responds to the student's
own words, building toward a personalized synthesis of their direction. Designed for use in
university settings (first-year experience, career-readiness, and advising contexts) as well
as by individuals.

- **Reflection, not counseling.** The experience surfaces a "this is reflection, not a
  substitute for counseling" boundary at the start of the journey and on heavier modules.
- **Privacy by design.** A student's raw answers and AI dialogue stay private to them;
  instructors see participation and only what a student explicitly chooses to share. See
  `docs/pmf-minimum-plan.md`.

## Tech stack

- Vite + React + TypeScript
- Tailwind CSS + shadcn/ui
- Supabase (Postgres, Auth, Edge Functions)
- AI coaching via a Supabase Edge Function (`supabase/functions/ai-coach`)

## Local development

Requires Node.js (or Bun). Then:

```sh
# install dependencies
npm i

# start the dev server with hot reload
npm run dev
```

Environment variables (see `.env`):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`

Edge functions additionally require `ANTHROPIC_API_KEY` (and, for the trend engine,
`INGEST_SECRET` / `SUPABASE_SERVICE_ROLE_KEY`) configured as function secrets — never commit
these.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run lint` | Lint |
| `npm run test` | Run tests (Vitest) |

## Docs

- `docs/brand-voice-and-copy.md` — brand, voice, and copy guide
- `docs/pmf-minimum-plan.md` — the university course-pilot data model and privacy boundary
- `docs/trend-engine/` — the trend engine (architecture, taxonomy, data model, scoring)
