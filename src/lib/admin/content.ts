import { getAdminSupabaseClient } from "@/lib/admin/data";

type ContentRow = Record<string, unknown>;

export type AdminContentItem = {
  id: string;
  title: string;
  description: string | null;
  status?: string;
  details: string[];
  updatedAt: string;
  href?: string;
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

export async function getAdminReflections(): Promise<AdminContentItem[]> {
  const [prompts, cards] = await Promise.all([
    list("reflection_prompts", "id,prompt_text,guidance_path,lesson_id,course_version_id,updated_at,created_at"),
    list("pause_reflect_cards", "id,question,context,lesson_id,updated_at,created_at"),
  ]);
  return [
    ...prompts.map((prompt) => ({
      id: `prompt-${text(prompt.id)}`,
      title: text(prompt.prompt_text),
      description: null,
      status: "Prompt",
      details: [optionalText(prompt.guidance_path) ?? "All paths", prompt.lesson_id ? "Lesson prompt" : "Course prompt"],
      updatedAt: updatedAt(prompt),
    })),
    ...cards.map((card) => ({
      id: `pause-${text(card.id)}`,
      title: text(card.question),
      description: optionalText(card.context),
      status: "Pause & reflect",
      details: [card.lesson_id ? "Lesson card" : "Standalone card"],
      updatedAt: updatedAt(card),
    })),
  ].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getAdminQuizzes(): Promise<AdminContentItem[]> {
  const [quizzes, questions] = await Promise.all([
    list("quizzes", "id,title,lesson_id,created_at", "created_at"),
    list("quiz_questions", "id,quiz_id,created_at", "created_at"),
  ]);
  const questionCount = new Map<string, number>();
  for (const question of questions) {
    const quizId = text(question.quiz_id);
    questionCount.set(quizId, (questionCount.get(quizId) ?? 0) + 1);
  }
  return quizzes.map((quiz) => ({
    id: text(quiz.id),
    title: optionalText(quiz.title) ?? "Untitled quiz",
    description: null,
    status: "Quiz",
    details: [`${questionCount.get(text(quiz.id)) ?? 0} questions`, `Lesson ${text(quiz.lesson_id).slice(0, 8)}`],
    updatedAt: updatedAt(quiz),
  }));
}

export async function getAdminResources(): Promise<AdminContentItem[]> {
  const resources = await list("resources", "id,title,description,category,url,is_published,sort_order,updated_at,created_at");
  return resources.map((resource) => ({
    id: text(resource.id),
    title: text(resource.title),
    description: optionalText(resource.description),
    status: resource.is_published ? "Published" : "Draft",
    details: [optionalText(resource.category) ?? "Uncategorized", `Order ${Number(resource.sort_order) || 0}`, resource.url ? "Link attached" : "No link"],
    updatedAt: updatedAt(resource),
  }));
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
