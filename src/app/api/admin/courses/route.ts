import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireAdminSession } from "@/lib/admin/guards";
import { hasTrustedOrigin } from "@/lib/security";

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
  let createdCourseId: string | null = null;
  try {
    if (!hasTrustedOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
    const actor = await requireAdminSession();
    if (!actor.user || actor.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const supabase = createSupabaseAdminClient() ?? actor.supabase;
    if (!supabase) return NextResponse.json({ error: "Admin data service is unavailable." }, { status: 503 });

    const payload = (await request.json()) as CoursePayload;

    if (!payload?.courseName?.trim() || !Array.isArray(payload.ChapterNames) || payload.ChapterNames.length > 100) {
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
    createdCourseId = course.id;

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
        throw new Error(versionError?.message ?? "Failed to create course version");
      }

      createdVersions.push(courseVersion);

      for (const [ChapterIndex, ChapterShell] of payload.ChapterNames.entries()) {
        const { data: ChapterRow, error: ChapterError } = await supabase
          .from("chapters")
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
          throw new Error(ChapterError?.message ?? "Failed to create Chapter");
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
            throw new Error(lessonError.message ?? "Failed to create lesson");
          }
        }
      }
    }

    return NextResponse.json({
      course,
      versions: createdVersions,
    });
  } catch (error) {
    if (createdCourseId) {
      const cleanup = createSupabaseAdminClient();
      if (cleanup) await cleanup.from("courses").delete().eq("id", createdCourseId);
    }
    const message = error instanceof Error ? error.message : "Failed to create Course";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


