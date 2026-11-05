-- Run once in Supabase SQL Editor. Required for Threads email OTP rate limiting.

create table if not exists public.security_rate_limits (
  bucket text primary key,
  window_started_at timestamptz not null default clock_timestamp(),
  request_count integer not null default 0 check (request_count >= 0)
);

alter table public.security_rate_limits enable row level security;
revoke all on public.security_rate_limits from anon, authenticated;

create or replace function public.security_take_rate_limit(
  p_bucket text,
  p_window_seconds integer,
  p_max_requests integer
) returns boolean
language plpgsql security definer set search_path = public as $$
declare allowed boolean;
begin
  if p_bucket is null or char_length(p_bucket) = 0 or p_window_seconds < 1 or p_max_requests < 1 then
    return false;
  end if;

  insert into public.security_rate_limits as limiter (bucket, window_started_at, request_count)
  values (p_bucket, clock_timestamp(), 1)
  on conflict (bucket) do update set
    request_count = case
      when limiter.window_started_at <= clock_timestamp() - make_interval(secs => p_window_seconds) then 1
      else limiter.request_count + 1
    end,
    window_started_at = case
      when limiter.window_started_at <= clock_timestamp() - make_interval(secs => p_window_seconds) then clock_timestamp()
      else limiter.window_started_at
    end
  returning request_count <= p_max_requests into allowed;

  return allowed;
end;
$$;

revoke all on function public.security_take_rate_limit(text, integer, integer) from public;
grant execute on function public.security_take_rate_limit(text, integer, integer) to service_role;
