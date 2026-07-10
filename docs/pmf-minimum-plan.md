# PMF-Minimum Technical Plan — University / Course-Pilot Wedge

**Goal:** ship the smallest product that lets a professor run the ikigai journey with a
real class this fall, while proving value with measurable outcomes — **without** building
the procurement-era stack (SSO/SAML, LTI, HECVAT, VPAT, billing) that only pays off after
PMF signal.

**Target pilot:** one professor → one course cohort (FYE / career-readiness) →
students complete the journey → professor sees participation + opt-in summaries →
we measure a pre/post clarity lift.

---

## 1. The privacy invariant (the one rule everything else obeys)

> **An instructor can see a student's _participation_ (joined, progress, completed) and
> anything the student _explicitly chooses to share_. An instructor can NEVER see a
> student's raw answers, AI-coach dialogue, or synthesis unless the student shares it.**

This distinction — **participation is visible, content is private** — is enforced in the
database (RLS), not just the UI. Module 3 ("My Fears") is the reason this is non-negotiable:
students will only be honest if the boundary is real.

**Concretely:** the existing `journeys` table (raw `state` JSONB) keeps its current
own-only RLS **untouched**. Instructors get *no* grant on it, ever. Everything an instructor
sees comes from *derived* projections (`journey_progress`) or *student-authored* shares
(`shared_summaries`).

---

## 2. Data model (new)

New tables only; no changes to `journeys` RLS. All timestamps `timestamptz default now()`.

```
cohorts
  id            uuid pk default gen_random_uuid()
  instructor_id uuid not null references profiles(id) on delete cascade
  name          text not null              -- "FYE 101 — Fall 2026, Section A"
  join_code     text not null unique       -- short, upper-case, e.g. "SKY7F2"
  term          text                       -- "Fall 2026"
  tone          text not null default 'campus'  -- copy variant (see §6)
  archived_at   timestamptz

cohort_members
  cohort_id  uuid not null references cohorts(id) on delete cascade
  user_id    uuid not null references profiles(id) on delete cascade
  role       text not null default 'student'   -- 'student' | 'instructor'
  joined_at  timestamptz not null default now()
  primary key (cohort_id, user_id)

journey_progress            -- DERIVED, no answer content ever
  user_id           uuid pk references profiles(id) on delete cascade
  modules_completed int  not null default 0
  total_modules     int  not null default 6
  current_module    int  not null default 1
  is_complete       bool not null default false
  last_active_at    timestamptz
  completed_at      timestamptz

shared_summaries            -- STUDENT-authored, opt-in
  id          uuid pk default gen_random_uuid()
  cohort_id   uuid not null references cohorts(id) on delete cascade
  student_id  uuid not null references profiles(id) on delete cascade
  summary     text not null              -- copy of ikigai synthesis at share time
  shared_at   timestamptz not null default now()
  unique (cohort_id, student_id)

checkpoint_responses        -- pre/post instrumentation, private to student
  id         uuid pk default gen_random_uuid()
  user_id    uuid not null references profiles(id) on delete cascade
  cohort_id  uuid references cohorts(id) on delete set null
  phase      text not null              -- 'pre' | 'post'
  clarity    int  not null              -- 1..5 Likert: "clear sense of direction"
  decided    int  not null              -- 1..5 Likert: major/career decidedness
  note       text
  created_at timestamptz not null default now()
  unique (user_id, cohort_id, phase)

analytic_events             -- lightweight funnel; durable copy even if we add Amplitude
  id         uuid pk default gen_random_uuid()
  user_id    uuid references profiles(id) on delete set null
  cohort_id  uuid references cohorts(id) on delete set null
  name       text not null              -- module_started | module_completed | journey_completed | ai_message | summary_shared
  props      jsonb not null default '{}'
  created_at timestamptz not null default now()
```

---

## 3. RLS — the enforcement of §1

Enable RLS on every new table. Policies (abbreviated):

- **`journeys`** — *unchanged*. Own-only SELECT/INSERT/UPDATE/DELETE. **No instructor policy added. This is the guarantee.**

- **`cohorts`**
  - instructor: full CRUD where `instructor_id = auth.uid()`.
  - student: SELECT where `exists (select 1 from cohort_members m where m.cohort_id = cohorts.id and m.user_id = auth.uid())`.
  - (Discovery-by-code happens only through the `join_cohort` RPC below, so no broad SELECT on `join_code`.)

- **`cohort_members`**
  - SELECT own row (`user_id = auth.uid()`).
  - instructor SELECT for cohorts they own (roster).
  - INSERT only via `join_cohort` RPC (security definer); no direct client INSERT policy.

- **`journey_progress`**
  - SELECT own row.
  - instructor SELECT where the row's `user_id` is a member of a cohort they own.
  - No client write policy — maintained solely by the trigger in §4.

- **`shared_summaries`**
  - student INSERT/UPDATE/DELETE own (`student_id = auth.uid()`), constrained to cohorts they're a member of.
  - instructor SELECT for cohorts they own.

- **`checkpoint_responses`**
  - own INSERT/SELECT only. Instructors read **aggregates** via the function in §5, never rows.

- **`analytic_events`**
  - own INSERT; SELECT own. Instructor aggregate access via function only.

**Net effect:** the only student-content an instructor can reach is a row the *student*
wrote into `shared_summaries`. Everything else they see is counts and status.

---

## 4. Progress projection (trigger) + join flow (RPC)

**Trigger** keeps `journey_progress` in sync from `journeys.state` server-side, so derived
status can't be spoofed and no answer content leaks into the projection:

```sql
create or replace function public.sync_journey_progress()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_done int; v_current int; v_complete boolean;
begin
  select count(*) into v_done
  from jsonb_each(coalesce(NEW.state->'modules', '{}'::jsonb)) m
  where (m.value->>'completed') = 'true';
  v_current  := coalesce((NEW.state->>'currentModule')::int, 1);
  v_complete := coalesce(NEW.state->>'ikigaiStatement', '') <> '';
  insert into public.journey_progress
    (user_id, modules_completed, current_module, is_complete, last_active_at, completed_at)
  values (NEW.user_id, v_done, v_current, v_complete, now(),
          case when v_complete then now() end)
  on conflict (user_id) do update set
    modules_completed = excluded.modules_completed,
    current_module    = excluded.current_module,
    is_complete       = excluded.is_complete,
    last_active_at    = now(),
    completed_at      = coalesce(public.journey_progress.completed_at, excluded.completed_at);
  return NEW;
end $$;

create trigger trg_sync_journey_progress
after insert or update on public.journeys
for each row execute function public.sync_journey_progress();
```

**Join-by-code RPC** (students can't SELECT cohorts by code directly; definer function
resolves the code and enrolls them):

```sql
create or replace function public.join_cohort(p_code text)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_cohort uuid;
begin
  select id into v_cohort from public.cohorts
   where join_code = upper(p_code) and archived_at is null;
  if v_cohort is null then raise exception 'invalid_code'; end if;
  insert into public.cohort_members (cohort_id, user_id, role)
  values (v_cohort, auth.uid(), 'student')
  on conflict do nothing;
  return v_cohort;
end $$;
```

---

## 5. Instrumentation & the value-proof readout

The pilot **is** a measurement instrument. Minimum to prove a clarity lift:

- **Pre checkpoint** before Module 1, **post checkpoint** after Module 6 → `checkpoint_responses`.
- **Funnel events** to `analytic_events`: module_started/completed, journey_completed, ai_message, summary_shared.
- **Instructor aggregate** via a threshold-guarded function (k-anonymity: return nothing below
  a minimum cohort size so individuals can't be inferred):

```sql
create or replace function public.cohort_clarity_lift(p_cohort uuid, p_min int default 5)
returns table (n int, avg_pre numeric, avg_post numeric, lift numeric)
language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.cohorts c
                 where c.id = p_cohort and c.instructor_id = auth.uid()) then
    raise exception 'not_authorized';
  end if;
  return query
  with pre  as (select user_id, clarity from public.checkpoint_responses
                where cohort_id = p_cohort and phase = 'pre'),
       post as (select user_id, clarity from public.checkpoint_responses
                where cohort_id = p_cohort and phase = 'post')
  select count(*)::int,
         round(avg(pre.clarity),2), round(avg(post.clarity),2),
         round(avg(post.clarity) - avg(pre.clarity),2)
  from pre join post using (user_id)
  having count(*) >= p_min;
end $$;
```

Optional: also emit the same events to **Amplitude** (connector available) for funnel
visualization — but `analytic_events` is the durable source of truth for the pilot readout.

**Deliverable per pilot:** a one-page readout — enrollment, completion %, avg clarity lift,
representative (opt-in, de-identified) student quotes. This is the sales collateral for the
career-center tier.

---

## 6. Frontend workstreams

1. **Join flow** — student enters a join code (extend `OnboardingPage.tsx`) → `join_cohort` RPC → routed into the journey. Solo/no-code use still works (cohort is optional).
2. **Instructor console** (new route, e.g. `/teach`) — create cohort (+ shareable code/link), roster with per-student *status only* (from `journey_progress`), shared-summary viewer, and the `cohort_clarity_lift` readout. Gate the instructor UI behind cohort ownership.
3. **Pre/post checkpoints** — two short Likert screens wired into the journey entry/exit.
4. **Share control** — on `ExportPage.tsx`, an explicit opt-in "Share my summary with my instructor" → writes `shared_summaries`. Clear copy that *only* the summary is shared, nothing else.
5. **Role-aware routing** — a user who owns a cohort sees the instructor console; students see the journey. Role lives on `cohort_members`, not globally.
6. **Tone pass** — a `campus` copy variant that reframes mystical/life-purpose language toward "career & life direction," selectable via `cohorts.tone`. Keep the existing variant; don't hard-code tone.
7. **Baseline accessibility hygiene** — keyboard nav, focus states, contrast, form labels, reduced-motion for `Starfield`/orb. Not a full VPAT; enough that a student tool isn't exclusionary.

---

## 7. Build sequence (mapped to the fall clock)

1. **Migration** — new tables, RLS, trigger, RPCs (§2–5). One reviewable SQL migration.
2. **Join flow + cohort creation** — smallest path to "a professor has a class, students are in it."
3. **Progress + instructor roster** — status visibility (proves the privacy boundary works).
4. **Checkpoints + events** — so the very first cohort is measured.
5. **Share control + tone pass + a11y hygiene** — polish that makes it classroom-credible.
6. **Pilot readout query/report** — the one-pager generator.

Target: 1–4 done well before late-August term start; 5–6 during the first weeks of term.

---

## 8. Explicitly OUT of scope (deferred to post-PMF)

Do **not** build these until professor pull is proven — they're procurement-era costs:

- SSO / SAML / Shibboleth / InCommon (pilot uses existing Google OAuth + join code).
- LTI 1.3 / Canvas-Blackboard-Moodle embedding.
- HECVAT, SOC 2, full VPAT/WCAG remediation.
- Billing / Stripe / seat management.
- The aggregate trend-engine "workforce/cohort direction" dashboard.
- Institution-level (multi-cohort, multi-department) tenancy and admin roles.

---

## 9. Open decisions (need input)

- **Instructor identity for pilot:** allow anyone to create a cohort, or gate cohort creation
  behind a manual allowlist of pilot professors? (Allowlist is safer; open is faster.)
- **Checkpoint scales:** use the two simple Likert items above, or adopt short forms of a
  validated scale (career decision self-efficacy / sense-of-purpose) for stronger evidence?
- **Anonymity threshold** `p_min`: 5 is a reasonable default; confirm acceptable for small
  seminar sections (which may enroll < 15).
