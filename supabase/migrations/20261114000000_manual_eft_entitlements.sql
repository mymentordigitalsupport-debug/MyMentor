-- Manual EFT payments, proof review, and entitlement-based course access.

create table if not exists public.payment_products (
  code text primary key,
  name text not null,
  amount_cents integer not null check (amount_cents > 0),
  access_level text not null check (access_level in ('chapter_1', 'full_course')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (access_level in ('chapter_1', 'full_course'))
);

create table if not exists public.payment_settings (
  id boolean primary key default true check (id),
  bank_name text not null,
  account_holder text not null,
  account_number text not null,
  branch_code text,
  instructions text,
  is_active boolean not null default true,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

create table if not exists public.payment_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_code text not null references public.payment_products(code),
  course_version_id uuid not null references public.course_versions(id) on delete restrict,
  chapter_id uuid references public.chapters(id) on delete restrict,
  amount_cents integer not null check (amount_cents > 0),
  payment_reference text not null unique,
  status text not null default 'pending' check (status in ('pending', 'under_review', 'approved', 'rejected', 'needs_resubmission', 'cancelled')),
  user_note text,
  admin_note text,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  alter table public.payment_requests drop constraint if exists payment_requests_status_check;
  alter table public.payment_requests add constraint payment_requests_status_check
    check (status in ('pending', 'under_review', 'approved', 'rejected', 'needs_resubmission', 'cancelled'));
end;
$$;

create table if not exists public.payment_proofs (
  id uuid primary key default gen_random_uuid(),
  payment_request_id uuid not null references public.payment_requests(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  storage_path text not null unique,
  original_filename text,
  mime_type text not null,
  file_size integer not null check (file_size > 0 and file_size <= 5242880),
  created_at timestamptz not null default now()
);

create table if not exists public.course_entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_version_id uuid not null references public.course_versions(id) on delete cascade,
  chapter_id uuid references public.chapters(id) on delete cascade,
  access_level text not null check (access_level in ('chapter_1', 'full_course')),
  payment_request_id uuid references public.payment_requests(id) on delete set null,
  active boolean not null default true,
  granted_at timestamptz not null default now(),
  unique(user_id, course_version_id, chapter_id, access_level)
);

create table if not exists public.payment_audit_log (
  id uuid primary key default gen_random_uuid(),
  payment_request_id uuid not null references public.payment_requests(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  previous_status text,
  new_status text,
  note text,
  created_at timestamptz not null default now()
);

insert into public.payment_products (code, name, amount_cents, access_level)
values ('chapter_1', 'Chapter 1', 2900, 'chapter_1'), ('full_course', 'Full course', 7900, 'full_course')
on conflict (code) do nothing;

create index if not exists idx_payment_requests_user on public.payment_requests(user_id, created_at desc);
create index if not exists idx_payment_requests_status on public.payment_requests(status, created_at desc);
create index if not exists idx_payment_proofs_request on public.payment_proofs(payment_request_id);
create index if not exists idx_entitlements_user on public.course_entitlements(user_id, active);
create index if not exists idx_entitlements_version on public.course_entitlements(course_version_id, chapter_id, active);
create unique index if not exists idx_entitlements_full_unique
  on public.course_entitlements(user_id, course_version_id, access_level)
  where chapter_id is null;

create or replace function public.review_manual_payment(
  p_payment_id uuid,
  p_actor_id uuid,
  p_action text,
  p_note text default null
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  payment_row public.payment_requests;
  product_row public.payment_products;
  next_status text;
  now_value timestamptz := now();
begin
  if current_user <> 'service_role' then raise exception 'Service role required'; end if;
  if p_action not in ('approve', 'reject', 'needs_resubmission') then raise exception 'Invalid review action'; end if;
  select * into payment_row from public.payment_requests where id = p_payment_id for update;
  if payment_row.id is null then raise exception 'Payment request not found'; end if;
  if payment_row.status in ('approved', 'rejected') and p_action = 'approve' then raise exception 'Payment is already finalized'; end if;
  next_status := case p_action when 'approve' then 'approved' when 'reject' then 'rejected' else 'needs_resubmission' end;
  if p_action = 'approve' then
    select * into product_row from public.payment_products where code = payment_row.product_code and is_active;
    if payment_row.course_version_id is null then raise exception 'Payment is not linked to course content'; end if;
    if product_row.access_level = 'full_course' then
      update public.course_entitlements
        set active = true, payment_request_id = payment_row.id, granted_at = now_value
        where user_id = payment_row.user_id and course_version_id = payment_row.course_version_id
          and access_level = product_row.access_level and chapter_id is null;
      if not found then
        insert into public.course_entitlements (user_id, course_version_id, chapter_id, access_level, payment_request_id, active)
          values (payment_row.user_id, payment_row.course_version_id, null, product_row.access_level, payment_row.id, true);
      end if;
    else
      insert into public.course_entitlements (user_id, course_version_id, chapter_id, access_level, payment_request_id, active)
        values (payment_row.user_id, payment_row.course_version_id, payment_row.chapter_id, product_row.access_level, payment_row.id, true)
        on conflict (user_id, course_version_id, chapter_id, access_level) do update set active = true, payment_request_id = excluded.payment_request_id, granted_at = now_value;
    end if;
    insert into public.user_course_enrollments (user_id, course_version_id, status, started_at)
      values (payment_row.user_id, payment_row.course_version_id, 'active', now_value)
      on conflict (user_id, course_version_id) do update set status = 'active';
  end if;
  update public.payment_requests set status = next_status, admin_note = nullif(p_note, ''), reviewed_by = p_actor_id, reviewed_at = now_value, updated_at = now_value where id = payment_row.id;
  insert into public.payment_audit_log (payment_request_id, actor_id, action, previous_status, new_status, note)
    values (payment_row.id, p_actor_id, p_action, payment_row.status, next_status, nullif(p_note, ''));
  return jsonb_build_object('status', next_status);
end;
$$;
revoke all on function public.review_manual_payment(uuid, uuid, text, text) from public, anon, authenticated;
grant execute on function public.review_manual_payment(uuid, uuid, text, text) to service_role;

alter table public.payment_products enable row level security;
alter table public.payment_settings enable row level security;
alter table public.payment_requests enable row level security;
alter table public.payment_proofs enable row level security;
alter table public.course_entitlements enable row level security;
alter table public.payment_audit_log enable row level security;

revoke all on public.payment_settings, public.payment_audit_log from anon, authenticated;
revoke all on public.payment_products, public.payment_requests, public.payment_proofs, public.course_entitlements from anon, authenticated;
grant select on public.payment_products to authenticated;
grant select, insert on public.payment_requests to authenticated;
grant update (status, user_note, submitted_at, updated_at) on public.payment_requests to authenticated;
grant select, insert on public.payment_proofs to authenticated;
grant select on public.course_entitlements to authenticated;

create policy "Members read active products" on public.payment_products
  for select to authenticated using (is_active = true);
create policy "Members read own payment requests" on public.payment_requests
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Members create own payment requests" on public.payment_requests
  for insert to authenticated with check (
    (select auth.uid()) = user_id and status = 'pending' and exists (
      select 1 from public.payment_products p
      where p.code = payment_requests.product_code and p.is_active and p.amount_cents = payment_requests.amount_cents
        and ((p.access_level = 'full_course' and payment_requests.chapter_id is null)
          or (p.access_level = 'chapter_1' and exists (
            select 1 from public.chapters c where c.id = payment_requests.chapter_id and c.course_version_id = payment_requests.course_version_id
          )))
    ) and exists (select 1 from public.course_versions cv where cv.id = payment_requests.course_version_id)
  );
create policy "Members update own pending payment requests" on public.payment_requests
  for update to authenticated using ((select auth.uid()) = user_id and status in ('pending', 'needs_resubmission'))
  with check ((select auth.uid()) = user_id and status in ('pending', 'needs_resubmission', 'under_review'));
create policy "Members read own payment proofs" on public.payment_proofs
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Members upload own payment proofs" on public.payment_proofs
  for insert to authenticated with check (
    (select auth.uid()) = user_id and exists (
      select 1 from public.payment_requests p
      where p.id = payment_proofs.payment_request_id and p.user_id = (select auth.uid())
        and p.status in ('pending', 'needs_resubmission')
    )
  );
create policy "Members read own entitlements" on public.course_entitlements
  for select to authenticated using ((select auth.uid()) = user_id);

-- Paid content is no longer available to anonymous/authenticated Data API callers.
revoke all on public.course_versions, public.chapters, public.lessons, public.lesson_content_blocks,
  public.reflection_prompts, public.pause_reflect_cards, public.quizzes, public.quiz_questions,
  public.mentor_videos, public.audio_tracks from anon, authenticated;
grant select on public.course_versions, public.chapters, public.lessons, public.lesson_content_blocks,
  public.reflection_prompts, public.pause_reflect_cards, public.quizzes, public.quiz_questions to authenticated;

create policy "Entitled members read course versions" on public.course_versions
  for select to authenticated using (exists (
    select 1 from public.course_entitlements e
    where e.user_id = (select auth.uid()) and e.course_version_id = course_versions.id and e.active
  ));
create policy "Entitled members read chapters" on public.chapters
  for select to authenticated using (exists (
    select 1 from public.course_entitlements e
    where e.user_id = (select auth.uid()) and e.course_version_id = chapters.course_version_id and e.active
      and (e.access_level = 'full_course' or e.chapter_id = chapters.id)
  ));
create policy "Entitled members read lessons" on public.lessons
  for select to authenticated using (exists (
    select 1 from public.chapters c
    join public.course_entitlements e on e.course_version_id = c.course_version_id
    where c.id = lessons.chapter_id and e.user_id = (select auth.uid()) and e.active
      and (e.access_level = 'full_course' or e.chapter_id = c.id)
  ));
create policy "Entitled members read lesson blocks" on public.lesson_content_blocks
  for select to authenticated using (exists (
    select 1 from public.lessons l
    join public.chapters c on c.id = l.chapter_id
    join public.course_entitlements e on e.course_version_id = c.course_version_id
    where l.id = lesson_content_blocks.lesson_id and e.user_id = (select auth.uid()) and e.active
      and (e.access_level = 'full_course' or e.chapter_id = c.id)
  ));
create policy "Entitled members read lesson support content" on public.reflection_prompts
  for select to authenticated using (exists (
    select 1 from public.course_entitlements e
    left join public.lessons l on l.id = reflection_prompts.lesson_id
    left join public.chapters c on c.id = l.chapter_id
    where e.user_id = (select auth.uid()) and e.active
      and e.course_version_id = c.course_version_id
      and (e.access_level = 'full_course' or e.chapter_id = c.id)
  ));
create policy "Entitled members read pause cards" on public.pause_reflect_cards
  for select to authenticated using (exists (
    select 1 from public.lessons l join public.chapters c on c.id = l.chapter_id
    join public.course_entitlements e on e.course_version_id = c.course_version_id
    where l.id = pause_reflect_cards.lesson_id and e.user_id = (select auth.uid()) and e.active
      and (e.access_level = 'full_course' or e.chapter_id = c.id)
  ));
create policy "Entitled members read quizzes" on public.quizzes
  for select to authenticated using (exists (
    select 1 from public.lessons l join public.chapters c on c.id = l.chapter_id
    join public.course_entitlements e on e.course_version_id = c.course_version_id
    where l.id = quizzes.lesson_id and e.user_id = (select auth.uid()) and e.active
      and (e.access_level = 'full_course' or e.chapter_id = c.id)
  ));
create policy "Entitled members read quiz questions" on public.quiz_questions
  for select to authenticated using (exists (
    select 1 from public.quizzes q join public.lessons l on l.id = q.lesson_id
    join public.chapters c on c.id = l.chapter_id
    join public.course_entitlements e on e.course_version_id = c.course_version_id
    where q.id = quiz_questions.quiz_id and e.user_id = (select auth.uid()) and e.active
      and (e.access_level = 'full_course' or e.chapter_id = c.id)
  ));
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('payment_proofs', 'payment_proofs', false, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "Members upload own payment proof files" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'payment_proofs' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Members view own payment proof files" on storage.objects
  for select to authenticated
  using (bucket_id = 'payment_proofs' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Members remove own payment proof files" on storage.objects
  for delete to authenticated
  using (bucket_id = 'payment_proofs' and (storage.foldername(name))[1] = (select auth.uid())::text);

