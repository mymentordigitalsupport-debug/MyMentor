-- EFT reviews must originate from a submitted proof and follow a strict state machine.

revoke update on table public.payment_requests from authenticated;
revoke update (status, user_note, submitted_at, updated_at)
  on table public.payment_requests from authenticated;

drop policy if exists "Members update own pending payment requests"
  on public.payment_requests;

create unique index if not exists payment_requests_one_active_per_user
  on public.payment_requests (user_id)
  where status in ('pending', 'under_review', 'needs_resubmission');

create or replace function public.enforce_manual_payment_status_transition()
returns trigger
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  has_current_proof boolean;
begin
  if new.status is not distinct from old.status then
    return new;
  end if;

  select exists (
    select 1
    from public.payment_proofs proof
    where proof.payment_request_id = old.id
      and proof.user_id = old.user_id
      and (
        old.status <> 'needs_resubmission'
        or proof.created_at > coalesce(old.reviewed_at, '-infinity'::timestamptz)
      )
  ) into has_current_proof;

  if old.status in ('pending', 'needs_resubmission') and new.status = 'under_review' then
    if not has_current_proof or new.submitted_at is null then
      raise exception 'Upload a new proof of payment before submitting this EFT request';
    end if;
    return new;
  end if;

  if old.status = 'under_review' and new.status in ('approved', 'rejected', 'needs_resubmission') then
    if not has_current_proof then
      raise exception 'This EFT request has no valid proof of payment';
    end if;
    if new.status in ('rejected', 'needs_resubmission') and nullif(btrim(new.admin_note), '') is null then
      raise exception 'A reviewer reason is required';
    end if;
    return new;
  end if;

  if old.status in ('pending', 'needs_resubmission') and new.status = 'cancelled' then
    return new;
  end if;

  raise exception 'Invalid EFT status transition from % to %', old.status, new.status;
end;
$$;

revoke all on function public.enforce_manual_payment_status_transition()
  from public, anon, authenticated;

drop trigger if exists enforce_manual_payment_status_transition
  on public.payment_requests;

create trigger enforce_manual_payment_status_transition
before update of status on public.payment_requests
for each row execute function public.enforce_manual_payment_status_transition();
