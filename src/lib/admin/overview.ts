import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type Row = Record<string, unknown>;
const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();

export type OverviewData = {
  stats: { title: string; value: number; recent: number; recentLabel: string }[];
  courses: { id: string; title: string; participants: number; avgProgress: number; completionRate: number }[];
  moods: { label: string; count: number }[];
  moodTotal: number;
};

export type AdminReviewCounts = {
  pendingArticles: number;
  pendingAuthors: number;
};

export async function getAdminReviewCounts(): Promise<AdminReviewCounts> {
  const admin = createSupabaseAdminClient();
  if (!admin) return { pendingArticles: 0, pendingAuthors: 0 };

  const [articles, authors] = await Promise.all([
    admin.from("article_articles").select("id", { count: "exact", head: true }).eq("status", "pending_review").is("deleted_at", null),
    admin.from("article_author_applications").select("id", { count: "exact", head: true }).eq("status", "pending"),
  ]);

  if (articles.error || authors.error) return { pendingArticles: 0, pendingAuthors: 0 };
  return { pendingArticles: articles.count ?? 0, pendingAuthors: authors.count ?? 0 };
}

export async function getAdminOverview(): Promise<OverviewData> {
  const admin = createSupabaseAdminClient();
  if (!admin) throw new Error("The admin data service is not configured.");
  const client = admin;

  async function rows(table: string, columns: string): Promise<Row[]> {
    const result: Row[] = [];
    for (let from = 0; ; from += 1000) {
      const { data, error } = await client.from(table).select(columns).range(from, from + 999);
      if (error) throw new Error(`${table}: ${error.message}`);
      const batch = (data ?? []) as unknown as Row[];
      result.push(...batch);
      if (batch.length < 1000) return result;
    }
  }

  const [profiles, enrollments, completions, journals, insights, moods, courses, versions, chapters, lessons] = await Promise.all([
    rows("profiles", "user_id,role,created_at"),
    rows("user_course_progress", "user_id,course_version_id,started_at,completed_at,last_active_at"),
    rows("user_lesson_progress", "user_id,lesson_id,completed_at"),
    rows("journal_entries", "id,created_at"),
    rows("saved_insights", "id,created_at"),
    rows("mood_checkins", "mood,created_at"),
    rows("courses", "id,title,is_published"),
    rows("course_versions", "id,course_id"),
    rows("chapters", "id,course_version_id"),
    rows("lessons", "id,chapter_id"),
  ]);

  const members = profiles.filter((row) => row.role === "user");
  const active = enrollments.filter((row) => !row.completed_at);
  const completedLessons = completions.filter((row) => Boolean(row.completed_at));
  const recent = (row: Row, key: string) => typeof row[key] === "string" && row[key] >= weekAgo;
  const stats = [
    { title: "Members", value: members.length, recent: members.filter((row) => recent(row, "created_at")).length, recentLabel: "new in the last 7 days" },
    { title: "Courses in progress", value: active.length, recent: active.filter((row) => recent(row, "last_active_at")).length, recentLabel: "active in the last 7 days" },
    { title: "Lessons completed", value: completedLessons.length, recent: completedLessons.filter((row) => recent(row, "completed_at")).length, recentLabel: "completed in the last 7 days" },
    { title: "Reflections created", value: journals.length, recent: journals.filter((row) => recent(row, "created_at")).length, recentLabel: "created in the last 7 days" },
    { title: "Insights saved", value: insights.length, recent: insights.filter((row) => recent(row, "created_at")).length, recentLabel: "saved in the last 7 days" },
  ];

  const versionCourse = new Map(versions.map((row) => [row.id, row.course_id]));
  const chapterVersion = new Map(chapters.map((row) => [row.id, row.course_version_id]));
  const lessonVersion = new Map(lessons.map((row) => [row.id, chapterVersion.get(row.chapter_id)]));
  const totalsByVersion = new Map<string, number>();
  for (const lesson of lessons) {
    const version = lessonVersion.get(lesson.id);
    if (typeof version === "string") totalsByVersion.set(version, (totalsByVersion.get(version) ?? 0) + 1);
  }
  const completedByUserVersion = new Map<string, number>();
  for (const row of completedLessons) {
    const version = lessonVersion.get(row.lesson_id);
    if (typeof version === "string") {
      const key = `${row.user_id}:${version}`;
      completedByUserVersion.set(key, (completedByUserVersion.get(key) ?? 0) + 1);
    }
  }
  const courseRows = courses.filter((row) => row.is_published).map((course) => {
    const participants = enrollments.filter((row) => versionCourse.get(row.course_version_id) === course.id);
    const progress = participants.reduce((sum, row) => {
      const total = totalsByVersion.get(String(row.course_version_id)) ?? 0;
      return sum + (total ? Math.min(100, (completedByUserVersion.get(`${row.user_id}:${row.course_version_id}`) ?? 0) / total * 100) : 0);
    }, 0);
    return {
      id: String(course.id), title: String(course.title), participants: participants.length,
      avgProgress: participants.length ? Math.round(progress / participants.length) : 0,
      completionRate: participants.length ? Math.round(participants.filter((row) => row.completed_at).length / participants.length * 100) : 0,
    };
  });
  const moodCounts = new Map<string, number>();
  for (const row of moods.filter((item) => recent(item, "created_at"))) {
    const label = String(row.mood).trim();
    if (label) moodCounts.set(label, (moodCounts.get(label) ?? 0) + 1);
  }
  const moodRows = [...moodCounts.entries()].sort((a, b) => b[1] - a[1]).map(([label, count]) => ({ label, count }));
  return { stats, courses: courseRows, moods: moodRows, moodTotal: moodRows.reduce((sum, row) => sum + row.count, 0) };
}
