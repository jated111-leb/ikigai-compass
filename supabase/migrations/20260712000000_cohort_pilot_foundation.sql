-- =============================================================
-- Cohort pilot foundation
--
-- Adds the multi-tenant course-pilot layer: classes (cohorts), membership,
-- a derived progress projection, student-authored shares, and pre/post
-- instrumentation.
--
-- PRIVACY INVARIANT (enforced here in RLS, not just the UI):
--   Instructors can see PARTICIPATION (join, progress, completion) and only
--   what a student EXPLICITLY shares (shared_summaries). They never gain any
--   access to journeys.state (raw answers / AI-coach dialogue). The journeys
--   table's own-only RLS is intentionally left UNTOUCHED by this migration.
--
-- RLS recursion is avoided by routing all cross-table membership/ownership
-- checks through SECURITY DEFINER helper functions (which bypass RLS), rather
-- than EXISTS subqueries that would re-trigger each other's policies.
-- =============================================================

-- ---------- Tables ----------

create table public.cohorts (
  id            uuid primary key default gen_random_uuid(),
  instructor_id uuid not null references public.profiles(id) on delete cascade,
  name          text not null,
  join_code     text not null unique,
  term          text,
  tone          text not null default 'campus',
  created_at    timestamptz not null default now(),
  archived_at   timestamptz
);

create table public.cohort_members (
  cohort_id uuid not null references public.cohorts(id) on delete cascade,
  user_id   uuid not null references public.profiles(id) on delete cascade,
  role      text not null default 'student' check (role in ('student', 'instructor')),
  joined_at timestamptz not null default now(),
  primary key (cohort_id, user_id)
);
create index cohort_members_user_idx on public.cohort_members(user_id);

-- Derived projection: NO answer content ever lands here.
create table public.journey_progress (
  user_id           uuid primary key references public.profiles(id) on delete cascade,
  modules_completed int not null default 0,
  total_modules     int not null default 6,
  current_module    int not null default 1,
  is_complete       boolean not null default false,
  last_active_at    timestamptz,
  completed_at      timestamptz
);

-- Student-authored, opt-in. The ONLY path student content reaches an instructor.
create table public.shared_summaries (
  id         uuid primary key default gen_random_uuid(),
  cohort_id  uuid not null references public.cohorts(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  summary    text not null,
  shared_at  timestamptz not null default now(),
  unique (cohort_id, student_id)
);

-- Pre/post instrumentation, private to the student (instructors read aggregates only).
create table public.checkpoint_responses (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  cohort_id  uuid references public.cohorts(id) on delete set null,
  phase      text not null check (phase in ('pre', 'post')),
  clarity    int not null check (clarity between 1 and 5),
  decided    int not null check (decided between 1 and 5),
  note       text,
  created_at timestamptz not null default now(),
  unique (user_id, cohort_id, phase)
);

create table public.analytic_events (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references public.profiles(id) on delete set null,
  cohort_id  uuid references public.cohorts(id) on delete set null,
  name       text not null,
  props      jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index analytic_events_cohort_idx on public.analytic_events(cohort_id, name);

-- ---------- Recursion-safe helpers (SECURITY DEFINER bypasses RLS) ----------

create or replace function public.is_cohort_instructor(p_cohort uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.cohorts c
    where c.id = p_cohort and c.instructor_id = auth.uid()
  );
$$;

create or replace function public.is_cohort_member(p_cohort uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.cohort_members m
    where m.cohort_id = p_cohort and m.user_id = auth.uid()
  );
$$;

create or replace function public.instructs_member(p_user uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from public.cohort_members m
    join public.cohorts c on c.id = m.cohort_id
    where m.user_id = p_user and c.instructor_id = auth.uid()
  );
$$;

-- ---------- RLS ----------

alter table public.cohorts             enable row level security;
alter table public.cohort_members      enable row level security;
alter table public.journey_progress    enable row level security;
alter table public.shared_summaries    enable row level security;
alter table public.checkpoint_responses enable row level security;
alter table public.analytic_events     enable row level security;

-- cohorts: instructor manages own; members may view.
create policy "cohorts_instructor_all" on public.cohorts
  for all using (instructor_id = auth.uid()) with check (instructor_id = auth.uid());
create policy "cohorts_member_select" on public.cohorts
  for select using (public.is_cohort_member(id));

-- cohort_members: self-view; instructor roster-view; self-leave; instructor-remove.
-- No INSERT policy: enrollment happens only via join_cohort() / the instructor trigger.
create policy "members_self_select" on public.cohort_members
  for select using (user_id = auth.uid());
create policy "members_instructor_select" on public.cohort_members
  for select using (public.is_cohort_instructor(cohort_id));
create policy "members_self_delete" on public.cohort_members
  for delete using (user_id = auth.uid());
create policy "members_instructor_delete" on public.cohort_members
  for delete using (public.is_cohort_instructor(cohort_id));

-- journey_progress: own + instructor-of-a-cohort-the-user-is-in. No write policy:
-- maintained solely by the SECURITY DEFINER trigger below.
create policy "progress_own_select" on public.journey_progress
  for select using (user_id = auth.uid());
create policy "progress_instructor_select" on public.journey_progress
  for select using (public.instructs_member(user_id));

-- shared_summaries: student manages own (must be a member); instructor reads own cohorts.
create policy "shares_student_all" on public.shared_summaries
  for all
  using (student_id = auth.uid())
  with check (student_id = auth.uid() and public.is_cohort_member(cohort_id));
create policy "shares_instructor_select" on public.shared_summaries
  for select using (public.is_cohort_instructor(cohort_id));

-- checkpoint_responses: strictly own (instructors read aggregates via RPC only).
create policy "checkpoints_own_all" on public.checkpoint_responses
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- analytic_events: own insert/select.
create policy "events_own_insert" on public.analytic_events
  for insert with check (user_id = auth.uid());
create policy "events_own_select" on public.analytic_events
  for select using (user_id = auth.uid());

-- ---------- Join-code generation ----------

create or replace function public.gen_join_code()
returns trigger language plpgsql set search_path = public as $$
declare
  v_code text;
  v_try  int := 0;
begin
  if new.join_code is not null and length(trim(new.join_code)) > 0 then
    new.join_code := upper(new.join_code);
    return new;
  end if;
  loop
    v_code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
    exit when not exists (select 1 from public.cohorts where join_code = v_code);
    v_try := v_try + 1;
    if v_try > 20 then
      raise exception 'could not generate a unique join code';
    end if;
  end loop;
  new.join_code := v_code;
  return new;
end $$;

create trigger trg_cohorts_join_code
before insert on public.cohorts
for each row execute function public.gen_join_code();

-- ---------- Instructor auto-membership ----------

create or replace function public.add_instructor_membership()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.cohort_members (cohort_id, user_id, role)
  values (new.id, new.instructor_id, 'instructor')
  on conflict (cohort_id, user_id) do nothing;
  return new;
end $$;

create trigger trg_cohorts_add_instructor
after insert on public.cohorts
for each row execute function public.add_instructor_membership();

-- ---------- Progress projection (derived from journeys.state) ----------

create or replace function public.sync_journey_progress()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_done    int;
  v_current int;
  v_complete boolean;
begin
  select count(*) into v_done
  from jsonb_each(coalesce(new.state->'modules', '{}'::jsonb)) as m(key, value)
  where (m.value->>'completed') = 'true';

  v_current  := coalesce((new.state->>'currentModule')::int, 1);
  v_complete := coalesce(new.state->>'ikigaiStatement', '') <> '';

  insert into public.journey_progress
    (user_id, modules_completed, current_module, is_complete, last_active_at, completed_at)
  values
    (new.user_id, v_done, v_current, v_complete, now(),
     case when v_complete then now() end)
  on conflict (user_id) do update set
    modules_completed = excluded.modules_completed,
    current_module    = excluded.current_module,
    is_complete       = excluded.is_complete,
    last_active_at    = now(),
    completed_at      = coalesce(public.journey_progress.completed_at, excluded.completed_at);

  return new;
end $$;

create trigger trg_sync_journey_progress
after insert or update on public.journeys
for each row execute function public.sync_journey_progress();

-- ---------- RPCs ----------

-- Enroll the caller into a cohort by its join code (students can't SELECT cohorts
-- by code directly; this definer function resolves + enrolls safely).
create or replace function public.join_cohort(p_code text)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_cohort uuid;
begin
  if auth.uid() is null then
    raise exception 'not_authenticated';
  end if;
  select id into v_cohort
  from public.cohorts
  where join_code = upper(p_code) and archived_at is null;
  if v_cohort is null then
    raise exception 'invalid_code';
  end if;
  insert into public.cohort_members (cohort_id, user_id, role)
  values (v_cohort, auth.uid(), 'student')
  on conflict (cohort_id, user_id) do nothing;
  return v_cohort;
end $$;

-- Threshold-guarded aggregate clarity lift for an instructor's cohort.
-- Returns NO rows below p_min matched pre/post pairs (k-anonymity).
create or replace function public.cohort_clarity_lift(p_cohort uuid, p_min int default 5)
returns table (n int, avg_pre numeric, avg_post numeric, lift numeric)
language plpgsql stable security definer set search_path = public as $$
begin
  if not exists (
    select 1 from public.cohorts c
    where c.id = p_cohort and c.instructor_id = auth.uid()
  ) then
    raise exception 'not_authorized';
  end if;

  return query
  with pre as (
    select user_id, clarity from public.checkpoint_responses
    where cohort_id = p_cohort and phase = 'pre'
  ),
  post as (
    select user_id, clarity from public.checkpoint_responses
    where cohort_id = p_cohort and phase = 'post'
  )
  select count(*)::int,
         round(avg(pre.clarity), 2),
         round(avg(post.clarity), 2),
         round(avg(post.clarity) - avg(pre.clarity), 2)
  from pre join post using (user_id)
  having count(*) >= p_min;
end $$;

grant execute on function public.join_cohort(text) to authenticated;
grant execute on function public.cohort_clarity_lift(uuid, int) to authenticated;
