-- Shared request limits. Only server routes authenticated with the service-role
-- key can consume a bucket; browser roles cannot read or alter the counters.
create table if not exists public.security_rate_limits (
  bucket text primary key check (char_length(bucket) between 1 and 300),
  window_started_at timestamptz not null default now(),
  request_count integer not null default 0 check (request_count >= 0),
  updated_at timestamptz not null default now()
);

alter table public.security_rate_limits enable row level security;
revoke all on table public.security_rate_limits from anon, authenticated;

create or replace function public.security_take_rate_limit(
  p_bucket text,
  p_window_seconds integer,
  p_max_requests integer
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  accepted boolean;
begin
  if auth.role() <> 'service_role' then
    raise exception 'Server credentials are required.' using errcode = '42501';
  end if;

  if p_bucket is null or char_length(p_bucket) not between 1 and 300
    or p_window_seconds not between 1 and 86400
    or p_max_requests not between 1 and 10000 then
    raise exception 'Invalid rate-limit parameters.' using errcode = '22023';
  end if;

  insert into public.security_rate_limits as limits (bucket, window_started_at, request_count, updated_at)
  values (p_bucket, now(), 1, now())
  on conflict (bucket) do update
    set window_started_at = case
          when now() - limits.window_started_at >= make_interval(secs => p_window_seconds) then now()
          else limits.window_started_at
        end,
        request_count = case
          when now() - limits.window_started_at >= make_interval(secs => p_window_seconds) then 1
          else limits.request_count + 1
        end,
        updated_at = now()
  returning request_count <= p_max_requests into accepted;

  return accepted;
end;
$$;

revoke all on function public.security_take_rate_limit(text, integer, integer) from public;
grant execute on function public.security_take_rate_limit(text, integer, integer) to service_role;
