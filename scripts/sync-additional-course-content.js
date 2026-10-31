const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const ROOT = path.resolve(__dirname, "..");

loadEnvFile(path.join(ROOT, ".env.local"));

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const COURSE_CONFIGS = [
  {
    manifestPath: path.join(
      ROOT,
      "public/3 summarized books/From Addicts to Leaders/lesson-information/seed-manifest.json"
    ),
    slug: "from-addicts-to-leaders",
    sortOrder: 2,
  },
  {
    manifestPath: path.join(
      ROOT,
      "public/3 summarized books/Protecting the Next Generation/lesson-information/seed-manifest.json"
    ),
    slug: "protecting-the-next-generation",
    sortOrder: 3,
  },
];

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;

  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const equalsIndex = trimmed.indexOf("=");
    if (equalsIndex === -1) continue;

    const key = trimmed.slice(0, equalsIndex).trim();
    let value = trimmed.slice(equalsIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function getBlockContent(blocks, type, field) {
  const block = blocks.find((item) => item.type === type);
  return typeof block?.content?.[field] === "string" ? block.content[field] : null;
}

function buildCoursePayload(config) {
  const manifest = JSON.parse(fs.readFileSync(config.manifestPath, "utf8"));

  return {
    title: manifest.courseTitle,
    slug: config.slug,
    description: manifest.description,
    sort_order: config.sortOrder,
    version: {
      guidance_path: "religious",
      title: `${manifest.courseTitle} - Religious Guidance`,
      description: manifest.description,
      chapters: manifest.chapters.map((chapter) => ({
        sort_order: chapter.sortOrder,
        title: chapter.title,
        description: chapter.description,
        lessons: chapter.lessons.map((lesson) => ({
          lesson_number: lesson.lessonNumber,
          title: lesson.title,
          subtitle: null,
          estimated_minutes: lesson.estimatedMinutes,
          opening_message:
            getBlockContent(lesson.blocks, "welcome", "message") ??
            getBlockContent(lesson.blocks, "reading", "title") ??
            null,
          encouragement_message:
            getBlockContent(lesson.blocks, "complete", "encouragement") ??
            getBlockContent(lesson.blocks, "complete", "message") ??
            null,
          blocks: lesson.blocks.map((block) => ({
            type: block.type,
            content: block.content,
          })),
        })),
      })),
    },
  };
}

async function selectSingle(table, query, label) {
  const { data, error } = await query.maybeSingle();
  if (error) {
    throw new Error(`${label}: ${error.message}`);
  }
  return data;
}

async function upsertCourse(course) {
  const existingCourse = await selectSingle(
    "courses",
    supabase.from("courses").select("id").eq("slug", course.slug),
    `select course ${course.slug}`
  );

  let courseId = existingCourse?.id;

  if (!courseId) {
    const { data, error } = await supabase
      .from("courses")
      .insert({
        title: course.title,
        slug: course.slug,
        description: course.description,
        is_published: true,
        sort_order: course.sort_order,
      })
      .select("id")
      .single();

    if (error) throw new Error(`insert course ${course.slug}: ${error.message}`);
    courseId = data.id;
  } else {
    const { error } = await supabase
      .from("courses")
      .update({
        title: course.title,
        slug: course.slug,
        description: course.description,
        is_published: true,
        sort_order: course.sort_order,
        updated_at: new Date().toISOString(),
      })
      .eq("id", courseId);

    if (error) throw new Error(`update course ${course.slug}: ${error.message}`);
  }

  return courseId;
}

async function upsertVersion(courseId, course) {
  const version = course.version;
  const existingVersion = await selectSingle(
    "course_versions",
    supabase
      .from("course_versions")
      .select("id")
      .eq("course_id", courseId)
      .eq("guidance_path", version.guidance_path),
    `select version ${course.slug}`
  );

  let versionId = existingVersion?.id;

  if (!versionId) {
    const { data, error } = await supabase
      .from("course_versions")
      .insert({
        course_id: courseId,
        title: version.title,
        description: version.description,
        status: "published",
        guidance_path: version.guidance_path,
      })
      .select("id")
      .single();

    if (error) throw new Error(`insert version ${course.slug}: ${error.message}`);
    versionId = data.id;
  } else {
    const { error } = await supabase
      .from("course_versions")
      .update({
        title: version.title,
        description: version.description,
        status: "published",
        updated_at: new Date().toISOString(),
      })
      .eq("id", versionId);

    if (error) throw new Error(`update version ${course.slug}: ${error.message}`);
  }

  return versionId;
}

async function upsertChapter(versionId, chapter) {
  const existingChapter = await selectSingle(
    "chapters",
    supabase
      .from("chapters")
      .select("id")
      .eq("course_version_id", versionId)
      .eq("sort_order", chapter.sort_order),
    `select chapter ${chapter.title}`
  );

  let chapterId = existingChapter?.id;

  if (!chapterId) {
    const { data, error } = await supabase
      .from("chapters")
      .insert({
        course_version_id: versionId,
        title: chapter.title,
        description: chapter.description,
        sort_order: chapter.sort_order,
        status: "published",
        is_published: true,
      })
      .select("id")
      .single();

    if (error) throw new Error(`insert chapter ${chapter.title}: ${error.message}`);
    chapterId = data.id;
  } else {
    const { error } = await supabase
      .from("chapters")
      .update({
        title: chapter.title,
        description: chapter.description,
        sort_order: chapter.sort_order,
        status: "published",
        is_published: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", chapterId);

    if (error) throw new Error(`update chapter ${chapter.title}: ${error.message}`);
  }

  return chapterId;
}

async function upsertLesson(chapterId, lesson) {
  const existingLesson = await selectSingle(
    "lessons",
    supabase
      .from("lessons")
      .select("id")
      .eq("chapter_id", chapterId)
      .eq("lesson_number", lesson.lesson_number),
    `select lesson ${lesson.title}`
  );

  let lessonId = existingLesson?.id;
  const payload = {
    title: lesson.title,
    subtitle: lesson.subtitle,
    lesson_number: lesson.lesson_number,
    estimated_minutes: lesson.estimated_minutes,
    opening_message: lesson.opening_message,
    encouragement_message: lesson.encouragement_message,
    sort_order: lesson.lesson_number,
    status: "published",
    is_published: true,
  };

  if (!lessonId) {
    const { data, error } = await supabase
      .from("lessons")
      .insert({ chapter_id: chapterId, ...payload })
      .select("id")
      .single();

    if (error) throw new Error(`insert lesson ${lesson.title}: ${error.message}`);
    lessonId = data.id;
  } else {
    const { error } = await supabase
      .from("lessons")
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq("id", lessonId);

    if (error) throw new Error(`update lesson ${lesson.title}: ${error.message}`);
  }

  const { error: deleteError } = await supabase
    .from("lesson_content_blocks")
    .delete()
    .eq("lesson_id", lessonId);

  if (deleteError) {
    throw new Error(`delete blocks ${lesson.title}: ${deleteError.message}`);
  }

  const blocks = lesson.blocks.map((block, index) => ({
    lesson_id: lessonId,
    block_type: block.type,
    content: block.content,
    sort_order: index + 1,
  }));

  const { error: insertError } = await supabase
    .from("lesson_content_blocks")
    .insert(blocks);

  if (insertError) {
    throw new Error(`insert blocks ${lesson.title}: ${insertError.message}`);
  }

  return lessonId;
}

async function syncCourse(config) {
  const course = buildCoursePayload(config);
  const courseId = await upsertCourse(course);
  const versionId = await upsertVersion(courseId, course);

  let lessonCount = 0;
  for (const chapter of course.version.chapters) {
    const chapterId = await upsertChapter(versionId, chapter);
    for (const lesson of chapter.lessons) {
      await upsertLesson(chapterId, lesson);
      lessonCount += 1;
    }
  }

  console.log(
    `Synced ${course.title}: ${course.version.chapters.length} chapters, ${lessonCount} lessons`
  );
}

async function main() {
  for (const config of COURSE_CONFIGS) {
    await syncCourse(config);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
