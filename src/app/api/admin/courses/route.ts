import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type CoursePayload = {
  courseName: string;
  subtitle: string;
  description: string;
  coverImageUrl: string;
  christianGuided: boolean;
  generalGuidance: boolean;
  ChapterNames: Array<{ name: string; description: string }>;
  lessonsPerChapter: number;
  lessonTitles: Record<number, Array<string | { title?: string }>>;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

async function getUniqueCourseSlug(
  supabase: ReturnType<typeof createSupabaseAdminClient> extends infer T ? NonNullable<T> : never,
  baseSlug: string
) {
  const { data, error } = await supabase
    .from("courses")
    .select("slug")
    .or(`slug.eq.${baseSlug},slug.like.${baseSlug}-%`);

  if (error) {
    throw error;
  }

  const existing = new Set((data ?? []).map((row) => row.slug));
  if (!existing.has(baseSlug)) {
    return baseSlug;
  }

  let suffix = 2;
  while (existing.has(`${baseSlug}-${suffix}`)) {
    suffix += 1;
  }

  return `${baseSlug}-${suffix}`;
}

function getLessonTitle(
  lesson: string | { title?: string } | undefined,
  fallbackIndex: number
) {
  if (typeof lesson === "string") {
    const normalized = lesson.trim();
    return normalized || `Lesson ${fallbackIndex + 1}`;
  }

  const normalized = lesson?.title?.trim();
  return normalized || `Lesson ${fallbackIndex + 1}`;
}

export async function POST(request: Request) {
  try {
    const authClient = await createSupabaseServerClient();
    const supabase = createSupabaseAdminClient() ?? authClient;

    const {
      data: { user },
    } = await authClient.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    const role = (user.app_metadata?.role as string | undefined) ?? profile?.role ?? null;

    if (role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const payload = (await request.json()) as CoursePayload;

    if (!payload.courseName.trim()) {
      return NextResponse.json({ error: "Course name is required" }, { status: 400 });
    }

    const versionsToCreate = [
      payload.christianGuided
        ? {
            guidance_path: "christian",
            title: `${payload.courseName} - Christian Guided`,
          }
        : null,
      payload.generalGuidance
        ? {
            guidance_path: "religious",
            title: `${payload.courseName} - Religious Guidance`,
          }
        : null,
    ].filter(Boolean) as Array<{ guidance_path: "christian" | "religious"; title: string }>;

    if (versionsToCreate.length === 0) {
      return NextResponse.json({ error: "Select at least one guidance path" }, { status: 400 });
    }

    const slug = await getUniqueCourseSlug(supabase, slugify(payload.courseName));
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .insert({
        title: payload.courseName.trim(),
        slug,
        description: payload.description.trim(),
        cover_image_url: payload.coverImageUrl.trim() || null,
        is_published: false,
      })
      .select("id, title, slug")
      .single();

    if (courseError || !course) {
      return NextResponse.json({ error: courseError?.message ?? "Failed to create Course" }, { status: 500 });
    }

    const createdVersions = [];

    for (const version of versionsToCreate) {
      const { data: courseVersion, error: versionError } = await supabase
        .from("course_versions")
        .insert({
          course_id: course.id,
          guidance_path: version.guidance_path,
          title: version.title,
          description: payload.subtitle.trim() || payload.description.trim(),
        })
        .select("id, guidance_path, title")
        .single();

      if (versionError || !courseVersion) {
        return NextResponse.json({ error: versionError?.message ?? "Failed to create course version" }, { status: 500 });
      }

      createdVersions.push(courseVersion);

      for (const [ChapterIndex, ChapterShell] of payload.ChapterNames.entries()) {
        const { data: ChapterRow, error: ChapterError } = await supabase
          .from("Chapters")
          .insert({
            course_version_id: courseVersion.id,
            title: ChapterShell.name.trim() || `Chapter ${ChapterIndex + 1}`,
            description: ChapterShell.description.trim() || null,
            sort_order: ChapterIndex + 1,
            is_published: false,
          })
          .select("id")
          .single();

        if (ChapterError || !ChapterRow) {
          return NextResponse.json({ error: ChapterError?.message ?? "Failed to create Chapter" }, { status: 500 });
        }

        const lessonTitles = payload.lessonTitles[ChapterIndex] ?? [];
        const lessonCount = Math.max(payload.lessonsPerChapter, lessonTitles.length);

        for (let lessonIndex = 0; lessonIndex < lessonCount; lessonIndex += 1) {
          const title = getLessonTitle(lessonTitles[lessonIndex], lessonIndex);
          const { error: lessonError } = await supabase.from("lessons").insert({
            chapter_id: ChapterRow.id,
            title,
            estimated_minutes: 10,
            sort_order: lessonIndex + 1,
            is_published: false,
          });

          if (lessonError) {
            return NextResponse.json({ error: lessonError.message ?? "Failed to create lesson" }, { status: 500 });
          }
        }
      }
    }

    return NextResponse.json({
      course,
      versions: createdVersions,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create Course";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


