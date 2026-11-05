import { getAdminSupabaseClient } from "@/lib/admin/data";
import { getStoredResourceFiles } from "@/lib/resource-library";

type ContentRow = Record<string, unknown>;

export type AdminContentItem = {
  id: string;
  title: string;
  description: string | null;
  status?: string;
  details: string[];
  updatedAt: string;
  href?: string;
  externalHref?: string;
};

export type AdminReflectionRecord = {
  id: string;
  category: "Prompt" | "Journal" | "Insight" | "Mood";
  subtype: string;
  title: string;
  content: string | null;
  lessonTitle: string;
  memberName: string | null;
  memberId: string | null;
  recordedAt: string;
  isResponse: boolean;
};

async function list(table: string, columns: string, orderBy = "updated_at") {
  const client = await getAdminSupabaseClient();
  const { data, error } = await client.from(table).select(columns).order(orderBy, { ascending: false });
  if (error) throw new Error(`${table}: ${error.message}`);
  return (data ?? []) as unknown as ContentRow[];
}

function text(value: unknown) {
  return typeof value === "string" ? value : "";
}

function optionalText(value: unknown) {
  const result = text(value).trim();
  return result || null;
}

function updatedAt(row: ContentRow) {
  return text(row.updated_at) || text(row.created_at);
}

export async function getAdminCourses(): Promise<AdminContentItem[]> {
  const courses = await list("courses", "id,title,description,is_published,sort_order,updated_at,created_at");
  return courses.map((course) => ({
    id: text(course.id),
    title: text(course.title),
    description: optionalText(course.description),
    status: course.is_published ? "Published" : "Draft",
    details: [`Order ${Number(course.sort_order) || 0}`],
    updatedAt: updatedAt(course),
    href: `/admin/courses/${text(course.id)}`,
  }));
}

export async function getAdminChapters(): Promise<AdminContentItem[]> {
  const chapters = await list("chapters", "id,title,description,is_published,sort_order,course_version_id,updated_at,created_at");
  return chapters.map((chapter) => ({
    id: text(chapter.id),
    title: text(chapter.title),
    description: optionalText(chapter.description),
    status: chapter.is_published ? "Published" : "Draft",
    details: [`Order ${Number(chapter.sort_order) || 0}`, `Version ${text(chapter.course_version_id).slice(0, 8)}`],
    updatedAt: updatedAt(chapter),
    href: `/admin/chapters/${text(chapter.id)}`,
  }));
}

export async function getAdminLessons(): Promise<AdminContentItem[]> {
  const lessons = await list("lessons", "id,title,is_published,estimated_minutes,sort_order,chapter_id,updated_at,created_at");
  return lessons.map((lesson) => ({
    id: text(lesson.id),
    title: text(lesson.title),
    description: null,
    status: lesson.is_published ? "Published" : "Draft",
    details: [
      `Order ${Number(lesson.sort_order) || 0}`,
      lesson.estimated_minutes ? `${lesson.estimated_minutes} min` : "No duration",
      `Chapter ${text(lesson.chapter_id).slice(0, 8)}`,
    ],
    updatedAt: updatedAt(lesson),
    href: `/admin/lessons/${text(lesson.id)}`,
  }));
}

export async function getAdminMedia(): Promise<AdminContentItem[]> {
  const [videos, audio] = await Promise.all([
    list("mentor_videos", "id,title,url,thumbnail,duration_s,updated_at,created_at"),
    list("audio_tracks", "id,title,url,duration_s,updated_at,created_at"),
  ]);
  return [
    ...videos.map((video) => ({
      id: `video-${text(video.id)}`,
      title: text(video.title),
      description: optionalText(video.url),
      status: "Video",
      details: [video.duration_s ? `${video.duration_s} sec` : "No duration", video.thumbnail ? "Thumbnail attached" : "No thumbnail"],
      updatedAt: updatedAt(video),
    })),
    ...audio.map((track) => ({
      id: `audio-${text(track.id)}`,
      title: text(track.title),
      description: optionalText(track.url),
      status: "Audio",
      details: [track.duration_s ? `${track.duration_s} sec` : "No duration"],
      updatedAt: updatedAt(track),
    })),
  ].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getAdminReflectionRecords(): Promise<AdminReflectionRecord[]> {
  const client = await getAdminSupabaseClient();
  const [blocksResult, lessonsResult, journalsResult, insightsResult, moodsResult, profilesResult] = await Promise.all([
    client
      .from("lesson_content_blocks")
      .select("id,lesson_id,block_type,title,content,sort_order,created_at,updated_at")
      .in("block_type", ["pause_reflect", "reflection_prompt", "journal_prompt", "mood_checkin"])
      .order("updated_at", { ascending: false }),
    client.from("lessons").select("id,title"),
    client.from("journal_entries").select("id,user_id,lesson_id,title,body,entry_text,created_at,updated_at").order("created_at", { ascending: false }),
    client.from("saved_insights").select("id,user_id,lesson_id,text,insight_text,created_at").order("created_at", { ascending: false }),
    client.from("mood_checkins").select("id,user_id,lesson_id,mood,mood_label,note,created_at").order("created_at", { ascending: false }),
    client.from("profiles").select("user_id,display_name,anonymous_name,is_anonymous"),
  ]);
  for (const result of [blocksResult, lessonsResult, journalsResult, insightsResult, moodsResult, profilesResult]) {
    if (result.error) throw new Error(`reflections: ${result.error.message}`);
  }
  const lessonTitles = new Map((lessonsResult.data ?? []).map((lesson) => [lesson.id, lesson.title ?? "Untitled lesson"]));
  const memberNames = new Map((profilesResult.data ?? []).map((profile) => [
    profile.user_id,
    profile.is_anonymous ? profile.anonymous_name || "Anonymous member" : profile.display_name || "Member",
  ]));
  const prompts = (blocksResult.data ?? []).map((block) => {
    const value = (block.content ?? {}) as Record<string, unknown>;
    const prompt = [value.prompt, value.question, value.message, block.title].find((item) => typeof item === "string" && item.trim()) as string | undefined;
    return {
      id: `block-${block.id}`,
      category: "Prompt",
      subtype: block.block_type.replaceAll("_", " "),
      title: prompt ?? "Reflection prompt",
      content: typeof value.context === "string" ? value.context : null,
      lessonTitle: lessonTitles.get(block.lesson_id) ?? "Unknown lesson",
      memberName: null,
      memberId: null,
      recordedAt: block.updated_at ?? block.created_at,
      isResponse: false,
    } satisfies AdminReflectionRecord;
  });
  const responses = [
    ...(journalsResult.data ?? []).map((entry) => ({
      id: `journal-${entry.id}`,
      category: "Journal" as const,
      subtype: "Journal response",
      title: entry.title || "Journal entry",
      content: entry.body || entry.entry_text || null,
      lessonTitle: lessonTitles.get(entry.lesson_id ?? "") ?? "No lesson",
      memberName: memberNames.get(entry.user_id) ?? "Member",
      memberId: entry.user_id,
      recordedAt: entry.updated_at ?? entry.created_at,
      isResponse: true,
    })),
    ...(insightsResult.data ?? []).map((insight) => ({
      id: `insight-${insight.id}`,
      category: "Insight" as const,
      subtype: "Saved insight",
      title: "Saved insight",
      content: insight.text || insight.insight_text || null,
      lessonTitle: lessonTitles.get(insight.lesson_id ?? "") ?? "No lesson",
      memberName: memberNames.get(insight.user_id) ?? "Member",
      memberId: insight.user_id,
      recordedAt: insight.created_at,
      isResponse: true,
    })),
    ...(moodsResult.data ?? []).map((mood) => ({
      id: `mood-${mood.id}`,
      category: "Mood" as const,
      subtype: "Mood check-in",
      title: mood.mood || mood.mood_label || "Mood check-in",
      content: mood.note || null,
      lessonTitle: lessonTitles.get(mood.lesson_id ?? "") ?? "No lesson",
      memberName: memberNames.get(mood.user_id) ?? "Member",
      memberId: mood.user_id,
      recordedAt: mood.created_at,
      isResponse: true,
    })),
  ] satisfies AdminReflectionRecord[];
  return [
    ...responses,
    ...prompts,
  ].sort((a, b) => b.recordedAt.localeCompare(a.recordedAt));
}

export async function getAdminReflections(): Promise<AdminContentItem[]> {
  const records = await getAdminReflectionRecords();
  return records.map((record) => ({
    id: record.id,
    title: record.title,
    description: record.content,
    status: record.subtype,
    details: [record.lessonTitle, ...(record.memberName ? [record.memberName] : [])],
    updatedAt: record.recordedAt,
  }));
}

export async function getAdminQuizzes(): Promise<AdminContentItem[]> {
  const client = await getAdminSupabaseClient();
  const [blocksResult, answersResult, lessonsResult] = await Promise.all([
    client.from("lesson_content_blocks").select("id,lesson_id,content,sort_order,created_at,updated_at").eq("block_type", "quiz").order("updated_at", { ascending: false }),
    client.from("lesson_quiz_answers").select("block_id,is_correct"),
    client.from("lessons").select("id,title"),
  ]);
  for (const result of [blocksResult, answersResult, lessonsResult]) {
    if (result.error) throw new Error(`quizzes: ${result.error.message}`);
  }
  const lessonTitles = new Map((lessonsResult.data ?? []).map((lesson) => [lesson.id, lesson.title ?? "Untitled lesson"]));
  const answerStats = new Map<string, { total: number; correct: number }>();
  for (const answer of answersResult.data ?? []) {
    if (!answer.block_id) continue;
    const stat = answerStats.get(answer.block_id) ?? { total: 0, correct: 0 };
    stat.total += 1;
    stat.correct += answer.is_correct ? 1 : 0;
    answerStats.set(answer.block_id, stat);
  }
  return (blocksResult.data ?? []).map((block) => {
    const content = (block.content ?? {}) as Record<string, unknown>;
    const options = Array.isArray(content.options) ? content.options : [];
    const correct = options.find((option) => option && typeof option === "object" && (option as Record<string, unknown>).is_correct);
    const stat = answerStats.get(block.id) ?? { total: 0, correct: 0 };
    const score = stat.total ? `${Math.round((stat.correct / stat.total) * 100)}% correct` : "No answers yet";
    return {
      id: block.id,
      title: typeof content.question === "string" ? content.question : "Quiz question",
      description: correct && typeof correct === "object" && typeof (correct as Record<string, unknown>).text === "string" ? `Correct answer: ${(correct as Record<string, string>).text}` : null,
      status: "Lesson quiz",
      details: [lessonTitles.get(block.lesson_id) ?? "Unknown lesson", `${options.length} options`, `${stat.total} response${stat.total === 1 ? "" : "s"}`, score],
      updatedAt: block.updated_at ?? block.created_at,
    } satisfies AdminContentItem;
  });
}

export async function getAdminResources(): Promise<AdminContentItem[]> {
  const [resources, files] = await Promise.all([
    list("resources", "id,title,description,category,file_url,is_published,sort_order,updated_at,created_at"),
    getStoredResourceFiles(),
  ]);
  const databaseItems = resources.map((resource) => ({
    id: text(resource.id),
    title: text(resource.title),
    description: optionalText(resource.description),
    status: resource.is_published ? "Published" : "Draft",
    details: [optionalText(resource.category) ?? "Uncategorized", `Order ${Number(resource.sort_order) || 0}`, resource.file_url ? "File attached" : "No file"],
    updatedAt: updatedAt(resource),
  }));
  const storedItems = files.map((file) => ({
    id: file.id,
    title: file.title,
    description: "Stored in the resources bucket.",
    status: "Storage file",
    details: [file.category, file.path],
    updatedAt: file.createdAt,
    externalHref: file.downloadUrl ?? undefined,
  }));
  return [...databaseItems, ...storedItems];
}

export async function getAdminLessonBuilderData() {
  const client = await getAdminSupabaseClient();
  const [lessonsResult, blocksResult] = await Promise.all([
    client
      .from("lessons")
      .select("id,title,estimated_minutes,sort_order,is_published,chapter_id,updated_at,chapters(title,course_versions(guidance_path,title,courses(title,slug)))")
      .order("sort_order", { ascending: true }),
    client
      .from("lesson_content_blocks")
      .select("id,lesson_id,block_type,content,sort_order")
      .order("sort_order", { ascending: true }),
  ]);
  if (lessonsResult.error) throw new Error(`lessons: ${lessonsResult.error.message}`);
  if (blocksResult.error) throw new Error(`lesson_content_blocks: ${blocksResult.error.message}`);
  return {
    lessons: (lessonsResult.data ?? []) as unknown as Array<Record<string, unknown>>,
    blocks: (blocksResult.data ?? []) as unknown as Array<Record<string, unknown>>,
  };
}
