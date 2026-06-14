import type { AccountStatus, GuidancePath, UserRole } from "@/types";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type AdminAuthUser = {
  id: string;
  email: string | null;
  created_at: string;
  updated_at: string | null;
  last_sign_in_at: string | null;
  confirmed_at: string | null;
  email_confirmed_at: string | null;
  phone: string | null;
  phone_confirmed_at: string | null;
  banned_until: string | null;
  app_metadata: Record<string, unknown>;
  user_metadata: Record<string, unknown>;
};

export type AdminUserRow = {
  profile_id: string;
  user_id: string;
  display_name: string | null;
  anonymous_name: string | null;
  is_anonymous: boolean;
  guidance_path: GuidancePath;
  role: UserRole;
  username: string | null;
  display_name_mode: string | null;
  selected_course_id: string | null;
  goal: string | null;
  mood_baseline: string | null;
  onboarding_step: number | null;
  onboarding_done: boolean;
  onboarding_completed_at: string | null;
  account_status: AccountStatus;
  account_status_reason: string | null;
  account_status_updated_at: string;
  anonymized_at: string | null;
  profile_created_at: string;
  profile_updated_at: string;
  email: string | null;
  auth_created_at: string | null;
  auth_updated_at: string | null;
  last_sign_in_at: string | null;
  confirmed_at: string | null;
  email_confirmed_at: string | null;
  phone: string | null;
  phone_confirmed_at: string | null;
  auth_banned_until: string | null;
  auth_app_metadata: Record<string, unknown>;
  auth_user_metadata: Record<string, unknown>;
  active_journey_title: string | null;
  active_version_title: string | null;
  active_last_active_at: string | null;
  journey_count: number;
  lesson_started_count: number;
  lesson_completed_count: number;
  journal_count: number;
  mood_count: number;
  saved_insight_count: number;
};

type EnrollmentRow = {
  user_id: string;
  course_version_id: string;
  started_at: string | null;
  completed_at: string | null;
  status: string | null;
};

export type AdminJournalEntry = {
  id: string;
  lesson_id: string | null;
  prompt_id: string | null;
  title: string | null;
  body: string;
  mood: string | null;
  is_private: boolean | null;
  created_at: string;
  updated_at: string;
};

export type AdminMoodCheckin = {
  id: string;
  lesson_id: string | null;
  mood: string;
  note: string | null;
  created_at: string;
};

export type AdminSavedInsight = {
  id: string;
  lesson_id: string | null;
  text: string;
  created_at: string;
};

export type AdminLessonContentBlock = {
  lesson_id: string;
  lesson_title: string | null;
  chapter_title: string | null;
  block_type: string;
  title: string | null;
  content: Record<string, unknown>;
  media_url: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type AdminQuizAnswer = {
  id: string;
  lesson_id: string;
  lesson_title: string | null;
  question_text: string;
  selected_answer: string;
  correct_answer: string | null;
  is_correct: boolean;
  answered_at: string;
};

export type AdminStepDuration = {
  lesson_id: string;
  lesson_title: string | null;
  step_key: string;
  step_order: number | null;
  duration_ms: number;
  visits: number;
};

export type AdminUserDetail = AdminUserRow & {
  auth: AdminAuthUser | null;
  profile: {
    id: string;
    user_id: string;
    display_name: string | null;
    anonymous_name: string | null;
    is_anonymous: boolean;
    preferred_guidance_path: GuidancePath;
    role: UserRole;
    username: string | null;
    display_name_mode: string | null;
    selected_course_id: string | null;
    personal_goal: string | null;
    mood_baseline: string | null;
    onboarding_completed: boolean;
    onboarding_step: number | null;
    onboarding_completed_at: string | null;
    status: string | null;
    created_at: string;
    updated_at: string;
  };
  course_progress: Array<{
    course_version_id: string;
    course_title: string | null;
    version_title: string | null;
    guidance_path: string;
    started_at: string;
    completed_at: string | null;
    last_active_at: string;
  }>;
  lesson_progress: Array<{
    lesson_id: string;
    lesson_title: string | null;
    chapter_title: string | null;
    started_at: string;
    completed_at: string | null;
  }>;
  journal_entries: AdminJournalEntry[];
  mood_checkins: AdminMoodCheckin[];
  saved_insights: AdminSavedInsight[];
  lesson_content_blocks: AdminLessonContentBlock[];
  quiz_answers: AdminQuizAnswer[];
  step_durations: AdminStepDuration[];
  chapters_completed_count: number;
  active_courses_count: number;
};

type SupabaseAdmin = NonNullable<ReturnType<typeof createSupabaseAdminClient>>;

function firstRelatedTitle(value: unknown): string | null {
  if (Array.isArray(value)) {
    const first = value[0];
    if (first && typeof first === "object" && "title" in first && typeof first.title === "string") {
      return first.title;
    }
    return null;
  }

  if (value && typeof value === "object" && "title" in value && typeof value.title === "string") {
    return value.title;
  }

  return null;
}

async function listAllAuthUsers(admin: SupabaseAdmin) {
  const users: AdminAuthUser[] = [];
  const perPage = 200;
  let page = 1;

  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) {
      throw error;
    }

    const current = data.users.map((user) => ({
      id: user.id,
      email: user.email ?? null,
      created_at: user.created_at,
      updated_at: user.updated_at ?? null,
      last_sign_in_at: user.last_sign_in_at ?? null,
      confirmed_at: user.confirmed_at ?? null,
      email_confirmed_at: user.email_confirmed_at ?? null,
      phone: user.phone ?? null,
      phone_confirmed_at: user.phone_confirmed_at ?? null,
      banned_until: user.banned_until ?? null,
      app_metadata: user.app_metadata ?? {},
      user_metadata: user.user_metadata ?? {},
    }));

    users.push(...current);

    if (current.length < perPage) {
      break;
    }

    page += 1;
  }

  return users;
}

function zeroedMap() {
  return new Map<string, number>();
}

export async function getAdminUsersDirectory() {
  const admin = createSupabaseAdminClient();
  if (!admin) {
    throw new Error("Supabase service role client is not configured");
  }

  const [profilesResult, courseVersionsResult, courseProgressResult, enrollmentResult, lessonProgressResult, lessonsResult, journalResult, moodResult, savedResult, authUsers] =
    await Promise.all([
      admin
        .from("profiles")
        .select(
          "id, user_id, display_name, anonymous_name, is_anonymous, preferred_guidance_path, role, username, display_name_mode, selected_course_id, personal_goal, mood_baseline, onboarding_completed, onboarding_step, onboarding_completed_at, status, created_at, updated_at"
        )
        .order("created_at", { ascending: false }),
      admin
        .from("course_versions")
        .select("id, course_id, title, guidance_path, courses(title, slug)"),
      admin
        .from("user_course_progress")
        .select("user_id, course_version_id, started_at, completed_at, last_active_at"),
      admin
        .from("user_course_enrollments")
        .select("user_id, course_version_id, started_at, completed_at, status"),
      admin
        .from("user_lesson_progress")
        .select("user_id, lesson_id, started_at, completed_at"),
      admin.from("lessons").select("id, title, chapter_id, chapters(title)"),
      admin.from("journal_entries").select("user_id, id"),
      admin.from("mood_checkins").select("user_id, id"),
      admin.from("saved_insights").select("user_id, id"),
      listAllAuthUsers(admin),
    ]);

  if (profilesResult.error) throw profilesResult.error;
  if (courseVersionsResult.error) throw courseVersionsResult.error;
  if (courseProgressResult.error) throw courseProgressResult.error;
  if (enrollmentResult.error) throw enrollmentResult.error;
  if (lessonProgressResult.error) throw lessonProgressResult.error;
  if (lessonsResult.error) throw lessonsResult.error;
  if (journalResult.error) throw journalResult.error;
  if (moodResult.error) throw moodResult.error;
  if (savedResult.error) throw savedResult.error;

  const authMap = new Map(authUsers.map((user) => [user.id, user]));
  const versionMap = new Map(
    (courseVersionsResult.data ?? []).map((version) => [
      version.id,
      {
        title: version.title,
        guidance_path: version.guidance_path as GuidancePath,
        course_title: firstRelatedTitle(version.courses),
      },
    ])
  );

  const progressByUser = new Map<string, AdminUserDetail["course_progress"]>();
  const activeProgressByUser = new Map<string, AdminUserDetail["course_progress"][number]>();
  for (const row of courseProgressResult.data ?? []) {
    const version = versionMap.get(row.course_version_id);
    if (!version) continue;

    const entry = {
      course_version_id: row.course_version_id,
      course_title: version.course_title,
      version_title: version.title,
      guidance_path: version.guidance_path,
      started_at: row.started_at,
      completed_at: row.completed_at,
      last_active_at: row.last_active_at,
    };

    const list = progressByUser.get(row.user_id) ?? [];
    list.push(entry);
    progressByUser.set(row.user_id, list);

    const current = activeProgressByUser.get(row.user_id);
    if (!current || row.last_active_at > current.last_active_at) {
      activeProgressByUser.set(row.user_id, entry);
    }
  }

  for (const row of (enrollmentResult.data ?? []) as EnrollmentRow[]) {
    if (progressByUser.has(row.user_id)) continue;
    const version = versionMap.get(row.course_version_id);
    if (!version) continue;

    const startedAt = row.started_at ?? row.completed_at ?? new Date(0).toISOString();
    const entry = {
      course_version_id: row.course_version_id,
      course_title: version.course_title,
      version_title: version.title,
      guidance_path: version.guidance_path,
      started_at: startedAt,
      completed_at: row.completed_at,
      last_active_at: row.completed_at ?? startedAt,
    };

    progressByUser.set(row.user_id, [entry]);
    activeProgressByUser.set(row.user_id, entry);
  }

  const lessonProgressByUser = new Map<string, AdminUserDetail["lesson_progress"]>();
  const lessonMap = new Map(
    (lessonsResult.data ?? []).map((lesson) => [
      lesson.id,
      {
        title: lesson.title as string | null,
        chapter_title: firstRelatedTitle(lesson.chapters),
      },
    ])
  );
  for (const row of lessonProgressResult.data ?? []) {
    const list = lessonProgressByUser.get(row.user_id) ?? [];
    const lesson = lessonMap.get(row.lesson_id);
    list.push({
      lesson_id: row.lesson_id,
      lesson_title: lesson?.title ?? null,
      chapter_title: lesson?.chapter_title ?? null,
      started_at: row.started_at,
      completed_at: row.completed_at,
    });
    lessonProgressByUser.set(row.user_id, list);
  }

  const journalCountByUser = zeroedMap();
  for (const row of journalResult.data ?? []) {
    journalCountByUser.set(row.user_id, (journalCountByUser.get(row.user_id) ?? 0) + 1);
  }

  const moodCountByUser = zeroedMap();
  for (const row of moodResult.data ?? []) {
    moodCountByUser.set(row.user_id, (moodCountByUser.get(row.user_id) ?? 0) + 1);
  }

  const insightCountByUser = zeroedMap();
  for (const row of savedResult.data ?? []) {
    insightCountByUser.set(row.user_id, (insightCountByUser.get(row.user_id) ?? 0) + 1);
  }

  const users: AdminUserRow[] = (profilesResult.data ?? []).map((profile) => {
    const auth = authMap.get(profile.user_id);
    const activeProgress = activeProgressByUser.get(profile.user_id) ?? null;
    const progress = progressByUser.get(profile.user_id) ?? [];
    const lessonProgress = lessonProgressByUser.get(profile.user_id) ?? [];
    const normalizedStatus = profile.is_anonymous
      ? "anonymized"
      : profile.status === "paused"
        ? "suspended"
        : profile.status === "blocked"
          ? "disabled"
          : "active";

    return {
      profile_id: profile.id,
      user_id: profile.user_id,
      display_name: profile.display_name ?? null,
      anonymous_name: profile.anonymous_name ?? null,
      is_anonymous: profile.is_anonymous,
      guidance_path:
        (profile.preferred_guidance_path as string | null) === "general"
          ? "religious"
          : ((profile.preferred_guidance_path as GuidancePath) ?? "religious"),
      role: (profile.role as UserRole) ?? "user",
      username: profile.username ?? null,
      display_name_mode: profile.display_name_mode ?? null,
      selected_course_id: profile.selected_course_id ?? null,
      goal: (profile.personal_goal as string | null) ?? null,
      mood_baseline: profile.mood_baseline ?? null,
      onboarding_step: profile.onboarding_step ?? null,
      onboarding_done: profile.onboarding_completed,
      onboarding_completed_at: profile.onboarding_completed_at ?? null,
      account_status: normalizedStatus as AccountStatus,
      account_status_reason: null,
      account_status_updated_at: profile.updated_at,
      anonymized_at: profile.is_anonymous ? profile.updated_at : null,
      profile_created_at: profile.created_at,
      profile_updated_at: profile.updated_at,
      email: auth?.email ?? null,
      auth_created_at: auth?.created_at ?? null,
      auth_updated_at: auth?.updated_at ?? null,
      last_sign_in_at: auth?.last_sign_in_at ?? null,
      confirmed_at: auth?.confirmed_at ?? null,
      email_confirmed_at: auth?.email_confirmed_at ?? null,
      phone: auth?.phone ?? null,
      phone_confirmed_at: auth?.phone_confirmed_at ?? null,
      auth_banned_until: auth?.banned_until ?? null,
      auth_app_metadata: auth?.app_metadata ?? {},
      auth_user_metadata: auth?.user_metadata ?? {},
      active_journey_title: activeProgress?.course_title ?? null,
      active_version_title: activeProgress?.version_title ?? null,
      active_last_active_at: activeProgress?.last_active_at ?? null,
      journey_count: progress.length,
      lesson_started_count: lessonProgress.length,
      lesson_completed_count: lessonProgress.filter((item) => item.completed_at).length,
      journal_count: journalCountByUser.get(profile.user_id) ?? 0,
      mood_count: moodCountByUser.get(profile.user_id) ?? 0,
      saved_insight_count: insightCountByUser.get(profile.user_id) ?? 0,
    };
  });

  return {
    users,
    stats: {
      total: users.length,
      active: users.filter((user) => user.account_status === "active").length,
      suspended: users.filter((user) => user.account_status === "suspended").length,
      disabled: users.filter((user) => user.account_status === "disabled").length,
      anonymized: users.filter((user) => user.account_status === "anonymized").length,
      anonymous: users.filter((user) => user.is_anonymous).length,
      named: users.filter((user) => !user.is_anonymous).length,
      onboardingDone: users.filter((user) => user.onboarding_done).length,
    },
  };
}

export async function getAdminUserDetail(userId: string) {
  const admin = createSupabaseAdminClient();
  if (!admin) {
    throw new Error("Supabase service role client is not configured");
  }

  const directory = await getAdminUsersDirectory();
  const user = directory.users.find((item) => item.user_id === userId) ?? null;
  if (!user) {
    return null;
  }

  const [
    courseProgressResult,
    enrollmentResult,
    lessonProgressResult,
    lessonsResult,
    chaptersResult,
    courseVersionsResult,
    journalEntriesResult,
    moodCheckinsResult,
    savedInsightsResult,
    quizAnswersResult,
    stepEventsResult,
  ] = await Promise.all([
    admin
      .from("user_course_progress")
      .select("course_version_id, started_at, completed_at, last_active_at")
      .eq("user_id", userId),
    admin
      .from("user_course_enrollments")
      .select("course_version_id, started_at, completed_at, status")
      .eq("user_id", userId),
    admin
      .from("user_lesson_progress")
      .select("lesson_id, started_at, completed_at")
      .eq("user_id", userId),
    admin.from("lessons").select("id, title, chapter_id, is_published, chapters(title)"),
    admin.from("chapters").select("id, title, course_version_id, is_published"),
    admin.from("course_versions").select("id, title, guidance_path, courses(title)"),
    admin
      .from("journal_entries")
      .select("id, lesson_id, title, entry_text, body, mood_label, mood, is_private, created_at, updated_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
    admin
      .from("mood_checkins")
      .select("id, lesson_id, mood_label, mood, note, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
    admin
      .from("saved_insights")
      .select("id, lesson_id, insight_text, text, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
    admin
      .from("lesson_quiz_answers")
      .select("id, lesson_id, question_text, selected_answer, correct_answer, is_correct, answered_at")
      .eq("user_id", userId)
      .order("answered_at", { ascending: false }),
    admin
      .from("lesson_step_events")
      .select("lesson_id, step_key, step_order, duration_ms")
      .eq("user_id", userId)
      .order("entered_at", { ascending: false }),
  ]);

  if (courseProgressResult.error) throw courseProgressResult.error;
  if (enrollmentResult.error) throw enrollmentResult.error;
  if (lessonProgressResult.error) throw lessonProgressResult.error;
  if (lessonsResult.error) throw lessonsResult.error;
  if (chaptersResult.error) throw chaptersResult.error;
  if (courseVersionsResult.error) throw courseVersionsResult.error;
  if (journalEntriesResult.error) throw journalEntriesResult.error;
  if (moodCheckinsResult.error) throw moodCheckinsResult.error;
  if (savedInsightsResult.error) throw savedInsightsResult.error;
  if (quizAnswersResult.error) throw quizAnswersResult.error;
  if (stepEventsResult.error) throw stepEventsResult.error;

  const courseProgress = courseProgressResult.data ?? [];
  const enrollments = (enrollmentResult.data ?? []) as Array<{
    course_version_id: string;
    started_at: string | null;
    completed_at: string | null;
    status: string | null;
  }>;
  const lessonProgress = lessonProgressResult.data ?? [];
  const lessons = lessonsResult.data ?? [];
  const chapters = chaptersResult.data ?? [];
  const courseVersions = courseVersionsResult.data ?? [];
  const journalEntries = journalEntriesResult.data ?? [];
  const moodCheckins = moodCheckinsResult.data ?? [];
  const savedInsights = savedInsightsResult.data ?? [];
  const quizAnswers = quizAnswersResult.data ?? [];
  const stepEvents = stepEventsResult.data ?? [];

  const lessonMap = new Map(
    (lessons ?? []).map((lesson) => [
      lesson.id,
      {
        title: lesson.title as string | null,
        chapter_title: firstRelatedTitle(lesson.chapters),
      },
    ])
  );
  const versionMap = new Map(
    (courseVersions ?? []).map((version) => [
      version.id,
      {
        title: version.title as string | null,
        guidance_path: version.guidance_path as GuidancePath,
        course_title: firstRelatedTitle(version.courses),
      },
    ])
  );

  const activeCourseVersionIds = [
    ...new Set([
      ...courseProgress.map((row) => row.course_version_id),
      ...enrollments.map((row) => row.course_version_id),
    ]),
  ];
  const completedLessonIds = new Set(
    lessonProgress.filter((row) => row.completed_at).map((row) => row.lesson_id)
  );
  const publishedLessons = lessons.filter((lesson) => lesson.is_published);
  const publishedLessonsByChapter = new Map<string, string[]>();
  for (const lesson of publishedLessons) {
    const entries = publishedLessonsByChapter.get(lesson.chapter_id) ?? [];
    entries.push(lesson.id);
    publishedLessonsByChapter.set(lesson.chapter_id, entries);
  }
  const chaptersCompletedCount = chapters.filter((chapter) => {
    const lessonIds = publishedLessonsByChapter.get(chapter.id) ?? [];
    return lessonIds.length > 0 && lessonIds.every((lessonId) => completedLessonIds.has(lessonId));
  }).length;
  let lessonContentBlocks: AdminLessonContentBlock[] = [];

  if (activeCourseVersionIds.length > 0) {
    const { data: chapters, error: chaptersError } = await admin
      .from("chapters")
      .select("id, title")
      .in("course_version_id", activeCourseVersionIds)
      .order("sort_order");

    if (chaptersError) {
      throw chaptersError;
    }

    const chapterMap = new Map(
      (chapters ?? []).map((chapter) => [
        chapter.id,
        {
          title: chapter.title as string | null,
        },
      ])
    );

    const relevantLessonIds = (lessons ?? [])
      .filter((lesson) => chapterMap.has(lesson.chapter_id))
      .map((lesson) => lesson.id);

    if (relevantLessonIds.length > 0) {
      const { data: contentBlocks, error: contentBlocksError } = await admin
        .from("lesson_content_blocks")
        .select("lesson_id, block_type, title, content, media_url, sort_order, created_at, updated_at")
        .in("lesson_id", relevantLessonIds)
        .order("lesson_id", { ascending: true })
        .order("sort_order", { ascending: true });

      if (contentBlocksError) {
        throw contentBlocksError;
      }

      lessonContentBlocks = (contentBlocks ?? []).map((block) => {
        const lesson = lessonMap.get(block.lesson_id);
        return {
          lesson_id: block.lesson_id,
          lesson_title: lesson?.title ?? null,
          chapter_title: lesson?.chapter_title ?? null,
          block_type: block.block_type,
          title: block.title ?? null,
          content: (block.content as Record<string, unknown>) ?? {},
          media_url: block.media_url ?? null,
          sort_order: block.sort_order ?? 0,
          created_at: block.created_at,
          updated_at: block.updated_at,
        };
      });
    }
  }

  const stepDurationMap = new Map<string, AdminStepDuration>();
  for (const event of stepEvents) {
    const lesson = lessonMap.get(event.lesson_id);
    const key = `${event.lesson_id}:${event.step_key}:${event.step_order ?? 0}`;
    const existing = stepDurationMap.get(key);
    if (existing) {
      existing.duration_ms += event.duration_ms ?? 0;
      existing.visits += 1;
    } else {
      stepDurationMap.set(key, {
        lesson_id: event.lesson_id,
        lesson_title: lesson?.title ?? null,
        step_key: event.step_key,
        step_order: event.step_order ?? null,
        duration_ms: event.duration_ms ?? 0,
        visits: 1,
      });
    }
  }

  return {
    ...user,
    auth: {
      id: user.user_id,
      email: user.email,
      created_at: user.auth_created_at ?? user.profile_created_at,
      updated_at: user.auth_updated_at,
      last_sign_in_at: user.last_sign_in_at,
      confirmed_at: user.confirmed_at,
      email_confirmed_at: user.email_confirmed_at,
      phone: user.phone,
      phone_confirmed_at: user.phone_confirmed_at,
      banned_until: user.auth_banned_until,
      app_metadata: user.auth_app_metadata,
      user_metadata: user.auth_user_metadata,
    },
    profile: {
      id: user.profile_id,
      user_id: user.user_id,
      display_name: user.display_name,
      anonymous_name: user.anonymous_name,
      is_anonymous: user.is_anonymous,
      preferred_guidance_path: user.guidance_path,
      role: user.role,
      username: user.username,
      display_name_mode: user.display_name_mode,
      selected_course_id: user.selected_course_id,
      personal_goal: user.goal,
      mood_baseline: user.mood_baseline,
      onboarding_completed: user.onboarding_done,
      onboarding_step: user.onboarding_step,
      onboarding_completed_at: user.onboarding_completed_at,
      status: user.account_status,
      created_at: user.profile_created_at,
      updated_at: user.profile_updated_at,
    },
    course_progress: (courseProgress.length > 0
      ? courseProgress
      : enrollments.map((row) => ({
          course_version_id: row.course_version_id,
          started_at: row.started_at ?? row.completed_at ?? user.profile_created_at,
          completed_at: row.completed_at,
          last_active_at: row.completed_at ?? row.started_at ?? user.profile_created_at,
        }))).map((row) => {
      const version = versionMap.get(row.course_version_id);
      return {
        course_version_id: row.course_version_id,
        course_title: version?.course_title ?? null,
        version_title: version?.title ?? null,
        guidance_path: version?.guidance_path ?? "religious",
        started_at: row.started_at,
        completed_at: row.completed_at,
        last_active_at: row.last_active_at,
      };
    }),
    lesson_progress: lessonProgress.map((row) => {
      const lesson = lessonMap.get(row.lesson_id);
      return {
        lesson_id: row.lesson_id,
        lesson_title: lesson?.title ?? null,
        chapter_title: lesson?.chapter_title ?? null,
        started_at: row.started_at,
        completed_at: row.completed_at,
      };
    }),
    journal_entries: journalEntries.map((entry) => ({
      id: entry.id,
      lesson_id: entry.lesson_id ?? null,
      prompt_id: null,
      title: entry.title ?? null,
      body: entry.body ?? entry.entry_text ?? "",
      mood: entry.mood ?? entry.mood_label ?? null,
      is_private: entry.is_private ?? null,
      created_at: entry.created_at,
      updated_at: entry.updated_at,
    })),
    mood_checkins: moodCheckins.map((checkin) => ({
      id: checkin.id,
      lesson_id: checkin.lesson_id ?? null,
      mood: checkin.mood ?? checkin.mood_label,
      note: checkin.note ?? null,
      created_at: checkin.created_at,
    })),
    saved_insights: savedInsights.map((insight) => ({
      id: insight.id,
      lesson_id: insight.lesson_id ?? null,
      text: insight.text ?? insight.insight_text ?? "",
      created_at: insight.created_at,
    })),
    lesson_content_blocks: lessonContentBlocks,
    quiz_answers: quizAnswers.map((answer) => ({
      id: answer.id,
      lesson_id: answer.lesson_id,
      lesson_title: lessonMap.get(answer.lesson_id)?.title ?? null,
      question_text: answer.question_text,
      selected_answer: answer.selected_answer,
      correct_answer: answer.correct_answer ?? null,
      is_correct: answer.is_correct,
      answered_at: answer.answered_at,
    })),
    step_durations: [...stepDurationMap.values()].sort((left, right) => {
      if (left.lesson_title === right.lesson_title) {
        return (left.step_order ?? 0) - (right.step_order ?? 0);
      }
      return (left.lesson_title ?? "").localeCompare(right.lesson_title ?? "");
    }),
    chapters_completed_count: chaptersCompletedCount,
    active_courses_count: activeCourseVersionIds.length,
  } satisfies AdminUserDetail;
}
