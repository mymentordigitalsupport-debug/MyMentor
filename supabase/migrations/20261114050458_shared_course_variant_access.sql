-- A purchase grants access to both guidance variants of the same course.
-- Progress remains separate because lessons and reflections differ by variant.

alter table public.profiles
  add column if not exists active_course_version_id uuid
  references public.course_versions(id) on delete set null;

create index if not exists idx_profiles_active_course_version
  on public.profiles(active_course_version_id)
  where active_course_version_id is not null;

-- Backfill the alternate guidance variant for existing active entitlements.
with source_entitlements as (
  select
    e.user_id,
    e.course_version_id as source_version_id,
    e.chapter_id as source_chapter_id,
    e.access_level,
    e.payment_request_id,
    e.active,
    e.granted_at,
    source_version.course_id
  from public.course_entitlements e
  join public.course_versions source_version on source_version.id = e.course_version_id
  where e.active
), full_variant_entitlements as (
  select
    source.user_id,
    variant.id as course_version_id,
    source.payment_request_id,
    source.granted_at
  from source_entitlements source
  join public.course_versions variant on variant.course_id = source.course_id
  where source.access_level = 'full_course'
), chapter_variant_entitlements as (
  select
    source.user_id,
    variant.id as course_version_id,
    variant_chapter.id as chapter_id,
    source.payment_request_id,
    source.granted_at
  from source_entitlements source
  join public.chapters source_chapter on source_chapter.id = source.source_chapter_id
  join public.course_versions variant on variant.course_id = source.course_id
  join public.chapters variant_chapter
    on variant_chapter.course_version_id = variant.id
   and variant_chapter.sort_order = source_chapter.sort_order
  where source.access_level = 'chapter_1'
), updated_full as (
  update public.course_entitlements target
  set
    active = true,
    payment_request_id = source.payment_request_id,
    granted_at = least(target.granted_at, source.granted_at)
  from full_variant_entitlements source
  where target.user_id = source.user_id
    and target.course_version_id = source.course_version_id
    and target.access_level = 'full_course'
    and target.chapter_id is null
  returning target.id
), inserted_full as (
  insert into public.course_entitlements (
    user_id, course_version_id, chapter_id, access_level,
    payment_request_id, active, granted_at
  )
  select
    source.user_id, source.course_version_id, null, 'full_course',
    source.payment_request_id, true, source.granted_at
  from full_variant_entitlements source
  where not exists (
    select 1
    from public.course_entitlements target
    where target.user_id = source.user_id
      and target.course_version_id = source.course_version_id
      and target.access_level = 'full_course'
      and target.chapter_id is null
  )
  on conflict do nothing
  returning id
)
insert into public.course_entitlements (
  user_id, course_version_id, chapter_id, access_level,
  payment_request_id, active, granted_at
)
select
  source.user_id, source.course_version_id, source.chapter_id, 'chapter_1',
  source.payment_request_id, true, source.granted_at
from chapter_variant_entitlements source
on conflict (user_id, course_version_id, chapter_id, access_level)
do update set
  active = true,
  payment_request_id = excluded.payment_request_id,
  granted_at = least(public.course_entitlements.granted_at, excluded.granted_at);

-- Set an active variant only when the member already has valid access.
update public.profiles profile
set active_course_version_id = variant.id
from public.course_versions variant
where profile.active_course_version_id is null
  and variant.course_id = profile.selected_course_id
  and variant.guidance_path = case
    when profile.preferred_guidance_path = 'christian' then 'christian'
    else 'religious'
  end
  and exists (
    select 1
    from public.course_entitlements entitlement
    where entitlement.user_id = profile.user_id
      and entitlement.course_version_id = variant.id
      and entitlement.active
  );

create or replace function public.review_manual_payment(
  p_payment_id uuid,
  p_actor_id uuid,
  p_action text,
  p_note text default null
) returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  payment_row public.payment_requests;
  product_row public.payment_products;
  source_version public.course_versions;
  variant_row public.course_versions;
  variant_chapter_id uuid;
  source_chapter_order integer;
  next_status text;
  now_value timestamptz := now();
begin
  if p_action not in ('approve', 'reject', 'needs_resubmission') then
    raise exception 'Invalid review action';
  end if;

  select * into payment_row
  from public.payment_requests
  where id = p_payment_id
  for update;

  if not found then
    raise exception 'Payment request not found';
  end if;

  if payment_row.status in ('approved', 'rejected', 'cancelled') then
    raise exception 'Payment request is already finalized';
  end if;

  select * into product_row
  from public.payment_products
  where code = payment_row.product_code
    and is_active;

  if not found then
    raise exception 'Payment product is unavailable';
  end if;

  select * into source_version
  from public.course_versions
  where id = payment_row.course_version_id;

  if not found then
    raise exception 'Payment is not linked to course content';
  end if;

  if product_row.access_level = 'chapter_1' then
    select sort_order into source_chapter_order
    from public.chapters
    where id = payment_row.chapter_id
      and course_version_id = source_version.id;

    if not found then
      raise exception 'Payment is not linked to a valid chapter';
    end if;
  end if;

  next_status := case p_action
    when 'approve' then 'approved'
    when 'reject' then 'rejected'
    else 'needs_resubmission'
  end;

  if p_action = 'approve' then
    for variant_row in
      select *
      from public.course_versions
      where course_id = source_version.course_id
    loop
      if product_row.access_level = 'full_course' then
        update public.course_entitlements
        set
          active = true,
          payment_request_id = payment_row.id,
          granted_at = now_value
        where user_id = payment_row.user_id
          and course_version_id = variant_row.id
          and access_level = 'full_course'
          and chapter_id is null;

        if not found then
          insert into public.course_entitlements (
            user_id, course_version_id, chapter_id, access_level,
            payment_request_id, active
          )
          values (
            payment_row.user_id, variant_row.id, null, 'full_course',
            payment_row.id, true
          );
        end if;
      else
        variant_chapter_id := null;
        select id into variant_chapter_id
        from public.chapters
        where course_version_id = variant_row.id
          and sort_order = source_chapter_order
        limit 1;

        if variant_chapter_id is not null then
          insert into public.course_entitlements (
            user_id, course_version_id, chapter_id, access_level,
            payment_request_id, active
          )
          values (
            payment_row.user_id, variant_row.id, variant_chapter_id,
            'chapter_1', payment_row.id, true
          )
          on conflict (user_id, course_version_id, chapter_id, access_level)
          do update set
            active = true,
            payment_request_id = excluded.payment_request_id,
            granted_at = now_value;
        end if;
      end if;

      insert into public.user_course_enrollments (
        user_id, course_version_id, status, started_at
      )
      values (payment_row.user_id, variant_row.id, 'active', now_value)
      on conflict (user_id, course_version_id)
      do update set status = 'active';
    end loop;

    update public.profiles
    set
      active_course_version_id = coalesce(active_course_version_id, payment_row.course_version_id),
      updated_at = now_value
    where user_id = payment_row.user_id;
  end if;

  update public.payment_requests
  set
    status = next_status,
    admin_note = nullif(p_note, ''),
    reviewed_by = p_actor_id,
    reviewed_at = now_value,
    updated_at = now_value
  where id = payment_row.id;

  insert into public.payment_audit_log (
    payment_request_id, actor_id, action,
    previous_status, new_status, note
  )
  values (
    payment_row.id, p_actor_id, p_action,
    payment_row.status, next_status, nullif(p_note, '')
  );

  return jsonb_build_object('status', next_status);
end;
$$;

revoke all on function public.review_manual_payment(uuid, uuid, text, text)
from public, anon, authenticated;

grant execute on function public.review_manual_payment(uuid, uuid, text, text)
to service_role;
