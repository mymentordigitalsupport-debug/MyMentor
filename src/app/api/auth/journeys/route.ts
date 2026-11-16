import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { COURSE_LIBRARY, normalizeCourseKey } from "@/lib/course-library";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = createSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Journey service unavailable" }, { status: 503 });
  }

  const [{ data: courses, error: coursesError }, { data: versions, error: versionsError }] = await Promise.all([
    admin
      .from("courses")
      .select("id, title, description")
      .eq("is_published", true)
      .order("sort_order"),
    admin
      .from("course_versions")
      .select("course_id, title, description, status, guidance_path")
      .eq("status", "published")
      .eq("guidance_path", "religious"),
  ]);

  if (coursesError || versionsError) {
    return NextResponse.json({ error: "Unable to load journeys" }, { status: 500 });
  }

  const versionByCourse = new Map<string, { description: string }>();
  for (const version of versions ?? []) {
    if (!versionByCourse.has(version.course_id)) {
      versionByCourse.set(version.course_id, { description: version.description ?? "" });
    }
  }

  const courseByTitle = new Map(
    (courses ?? []).map((course) => [normalizeCourseKey(course.title), course])
  );

  return NextResponse.json(
    {
      books: COURSE_LIBRARY.map((book) => {
        const course = courseByTitle.get(normalizeCourseKey(book.title));
        const version = course ? versionByCourse.get(course.id) : undefined;
        return {
          title: book.title,
          description: version?.description || course?.description || book.description,
          image: book.image,
          courseId: course?.id ?? null,
          isAvailable: book.isAvailable && Boolean(course && version),
        };
      }),
    },
    { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" } }
  );
}
