-- =============================================================
-- AI usage rate limiting
--
-- Backs the ai-coach edge function's per-user throttle. The function now
-- requires an authenticated user; this adds fixed-window counters (per-minute
-- and per-day) so a single account cannot run up unbounded Anthropic spend.
--
-- The counter table is client-invisible (RLS on, no policies); it is written
-- only by the SECURITY DEFINER function below.
-- =============================================================

create table public.ai_usage_counters (
  user_id      uuid not null references public.profiles(id) on delete cascade,
  bucket       text not null,               -- 'min' | 'day'
  window_start timestamptz not null default now(),
  count        int not null default 0,
  primary key (user_id, bucket)
);

alter table public.ai_usage_counters enable row level security;
-- No policies: only the definer function (or service role) may touch this table.

-- Atomically roll the window if expired, increment, and report whether the
-- caller is still within p_limit for this bucket. Returns true = allowed.
create or replace function public.check_ai_rate_limit(
  p_bucket text,
  p_limit int,
  p_window_seconds int
)
returns boolean
language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_now timestamptz := now();
  v_count int;
begin
  if v_uid is null then
    return false;
  end if;

  insert into public.ai_usage_counters (user_id, bucket, window_start, count)
  values (v_uid, p_bucket, v_now, 1)
  on conflict (user_id, bucket) do update set
    window_start = case
      when v_now - public.ai_usage_counters.window_start >= make_interval(secs => p_window_seconds)
      then v_now
      else public.ai_usage_counters.window_start
    end,
    count = case
      when v_now - public.ai_usage_counters.window_start >= make_interval(secs => p_window_seconds)
      then 1
      else public.ai_usage_counters.count + 1
    end
  returning count into v_count;

  return v_count <= p_limit;
end $$;

grant execute on function public.check_ai_rate_limit(text, int, int) to authenticated;
