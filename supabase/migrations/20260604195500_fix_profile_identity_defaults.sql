create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = 'public'
as $function$
declare
  requested_display_name text;
  requested_anonymous_name text;
  requested_username text;
  normalized_username text;
  final_username text;
  requested_guidance_path text;
  selected_course uuid;
  is_anon boolean;
  suffix integer := 0;
begin
  is_anon := coalesce((new.raw_user_meta_data->>'is_anonymous')::boolean, false);

  requested_display_name := coalesce(
    nullif(new.raw_user_meta_data->>'display_name', ''),
    split_part(coalesce(new.email, 'friend'), '@', 1),
    'Friend'
  );

  requested_anonymous_name := case
    when is_anon then coalesce(
      nullif(new.raw_user_meta_data->>'anonymous_name', ''),
      requested_display_name
    )
    else null
  end;

  if not is_anon then
    requested_username := coalesce(
      nullif(new.raw_user_meta_data->>'username', ''),
      split_part(coalesce(new.email, 'friend'), '@', 1),
      'friend'
    );

    normalized_username := lower(regexp_replace(requested_username, '[^a-z0-9_]+', '', 'g'));
    if normalized_username = '' then
      normalized_username := 'user';
    end if;

    final_username := normalized_username;
    while exists (
      select 1
      from public.profiles p
      where p.username = final_username
        and p.id <> new.id
    ) loop
      suffix := suffix + 1;
      final_username := normalized_username || suffix::text;
    end loop;
  else
    final_username := null;
  end if;

  requested_guidance_path := case
    when new.raw_user_meta_data->>'preferred_guidance_path' in ('christian', 'religious')
      then new.raw_user_meta_data->>'preferred_guidance_path'
    else 'religious'
  end;

  begin
    selected_course := nullif(new.raw_user_meta_data->>'selected_course_id', '')::uuid;
  exception
    when others then
      selected_course := null;
  end;

  insert into public.profiles (
    id,
    user_id,
    display_name,
    username,
    avatar_url,
    is_anonymous,
    anonymous_name,
    preferred_guidance_path,
    onboarding_completed,
    role,
    status,
    display_name_mode,
    selected_course_id,
    personal_goal,
    mood_baseline,
    onboarding_step,
    onboarding_completed_at,
    created_at,
    updated_at
  )
  values (
    new.id,
    new.id,
    requested_display_name,
    final_username,
    null,
    is_anon,
    requested_anonymous_name,
    requested_guidance_path,
    false,
    'user',
    'active',
    case when is_anon then 'nickname' else 'real_name' end,
    selected_course,
    null,
    null,
    1,
    null,
    now(),
    now()
  )
  on conflict (id) do update set
    user_id = excluded.user_id,
    display_name = excluded.display_name,
    username = excluded.username,
    avatar_url = excluded.avatar_url,
    is_anonymous = excluded.is_anonymous,
    anonymous_name = excluded.anonymous_name,
    preferred_guidance_path = excluded.preferred_guidance_path,
    onboarding_completed = excluded.onboarding_completed,
    role = excluded.role,
    status = excluded.status,
    display_name_mode = excluded.display_name_mode,
    selected_course_id = excluded.selected_course_id,
    personal_goal = excluded.personal_goal,
    mood_baseline = excluded.mood_baseline,
    onboarding_step = excluded.onboarding_step,
    onboarding_completed_at = excluded.onboarding_completed_at,
    updated_at = now();

  return new;
end;
$function$;
