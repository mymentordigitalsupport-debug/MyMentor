-- A member pays once per access level: R29 for chapter one, then R50 to upgrade,
-- or R79 once for the complete course. Enforce this in the database as well as the API.

insert into public.payment_products (code, name, amount_cents, access_level, is_active)
values ('full_course_upgrade', 'Upgrade to full course', 5000, 'full_course', true)
on conflict (code) do update
set
  name = excluded.name,
  amount_cents = excluded.amount_cents,
  access_level = excluded.access_level,
  is_active = excluded.is_active,
  updated_at = now();

create or replace function public.validate_manual_payment_request()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  product_row public.payment_products;
  source_course_id uuid;
  has_chapter_access boolean;
  has_full_access boolean;
begin
  select * into product_row
  from public.payment_products
  where code = new.product_code
    and is_active;

  if not found then
    raise exception 'Payment product is unavailable';
  end if;

  if new.amount_cents <> product_row.amount_cents then
    raise exception 'Payment amount does not match the selected product';
  end if;

  select course_id into source_course_id
  from public.course_versions
  where id = new.course_version_id;

  if not found then
    raise exception 'Payment is not linked to a valid course';
  end if;

  if product_row.access_level = 'chapter_1' then
    if new.chapter_id is null or not exists (
      select 1
      from public.chapters
      where id = new.chapter_id
        and course_version_id = new.course_version_id
    ) then
      raise exception 'Payment is not linked to a valid chapter';
    end if;
  elsif new.chapter_id is not null then
    raise exception 'Full-course payments cannot be linked to one chapter';
  end if;

  if exists (
    select 1
    from public.payment_requests request
    join public.course_versions version on version.id = request.course_version_id
    where request.user_id = new.user_id
      and version.course_id = source_course_id
      and request.status in ('pending', 'under_review', 'needs_resubmission')
  ) then
    raise exception 'A payment request for this course is already in progress';
  end if;

  select
    coalesce(bool_or(entitlement.access_level = 'chapter_1'), false),
    coalesce(bool_or(entitlement.access_level = 'full_course'), false)
  into has_chapter_access, has_full_access
  from public.course_entitlements entitlement
  join public.course_versions version on version.id = entitlement.course_version_id
  where entitlement.user_id = new.user_id
    and entitlement.active
    and version.course_id = source_course_id;

  if product_row.code = 'chapter_1' and (has_chapter_access or has_full_access) then
    raise exception 'Chapter 1 is already unlocked for this course';
  end if;

  if product_row.code = 'full_course_upgrade' then
    if has_full_access then
      raise exception 'The full course is already unlocked';
    end if;
    if not has_chapter_access then
      raise exception 'The R50 upgrade is available after Chapter 1 is unlocked';
    end if;
  elsif product_row.access_level = 'full_course' then
    if has_full_access then
      raise exception 'The full course is already unlocked';
    end if;
    if has_chapter_access then
      raise exception 'Use the R50 upgrade after buying Chapter 1';
    end if;
  end if;

  return new;
end;
$$;

revoke all on function public.validate_manual_payment_request() from public, anon, authenticated;

drop trigger if exists validate_manual_payment_request on public.payment_requests;
create trigger validate_manual_payment_request
before insert on public.payment_requests
for each row execute function public.validate_manual_payment_request();
