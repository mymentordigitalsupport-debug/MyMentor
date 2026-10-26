const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

function environmentValue(name) {
  const source = fs.readFileSync(path.join(process.cwd(), ".env.local"), "utf8");
  const line = source.split(/\r?\n/).find((value) => value.startsWith(`${name}=`));
  return line ? line.slice(name.length + 1).trim().replace(/^['"]|['"]$/g, "") : "";
}

async function allRows(client, table) {
  const result = [];
  for (let start = 0; ; start += 1000) {
    let data;
    let error;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        ({ data, error } = await client.from(table).select("*").range(start, start + 999));
      } catch (requestError) {
        error = requestError;
      }
      if (!error) break;
    }
    if (error) throw new Error(`${table}: ${error.message}`);
    result.push(...data);
    if (data.length < 1000) return result;
  }
}

function grouped(rows, field) {
  return rows.reduce((map, row) => {
    const bucket = map.get(row[field]) ?? [];
    bucket.push(row);
    map.set(row[field], bucket);
    return map;
  }, new Map());
}

function ordered(rows, field = "sort_order") {
  return [...rows].sort((left, right) => (left[field] ?? 0) - (right[field] ?? 0) || String(left.title).localeCompare(String(right.title)));
}

function copy(value) {
  return typeof value === "string" && value.trim() ? value.trim() : "Not provided.";
}

function materialDescription(value, materialType) {
  const description = copy(value);
  return materialType === "Guidance book"
    ? description.replace(/\bcourse\b/gi, "guidance book")
    : description;
}

function save(name, lines) {
  fs.writeFileSync(path.join(process.cwd(), "knowledge", name), `${lines.join("\n").trim()}\n`, "utf8");
}

async function main() {
  const url = environmentValue("NEXT_PUBLIC_SUPABASE_URL");
  const key = environmentValue("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) throw new Error("Missing Supabase server configuration.");

  const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const courses = await allRows(supabase, "courses");
  const versions = await allRows(supabase, "course_versions");
  const chapters = await allRows(supabase, "chapters");
  const lessons = await allRows(supabase, "lessons");
  const blocks = await allRows(supabase, "lesson_content_blocks");

  const publicCourses = ordered(courses.filter((row) => row.is_published));
  const fullCourses = publicCourses.filter((row) => row.slug === "uprooting-drug-abuse");
  const guidanceBooks = publicCourses.filter((row) => row.slug !== "uprooting-drug-abuse");
  const courseIds = new Set(publicCourses.map((row) => row.id));
  const publicVersions = versions.filter((row) => courseIds.has(row.course_id) && (!row.status || row.status === "published"));
  const versionIds = new Set(publicVersions.map((row) => row.id));
  const publicChapters = chapters.filter((row) => versionIds.has(row.course_version_id) && row.is_published !== false && (!row.status || row.status === "published"));
  const chapterIds = new Set(publicChapters.map((row) => row.id));
  const publicLessons = lessons.filter((row) => chapterIds.has(row.chapter_id) && row.is_published !== false && (!row.status || row.status === "published"));
  const lessonIds = new Set(publicLessons.map((row) => row.id));
  const publicBlocks = blocks.filter((row) => lessonIds.has(row.lesson_id));
  const versionsByCourse = grouped(publicVersions, "course_id");
  const chaptersByVersion = grouped(publicChapters, "course_version_id");
  const lessonsByChapter = grouped(publicLessons, "chapter_id");
  const blocksByLesson = grouped(publicBlocks, "lesson_id");
  const generated = new Date().toISOString().slice(0, 10);

  fs.mkdirSync(path.join(process.cwd(), "knowledge"), { recursive: true });
  save("mymentor.md", [
    "# My Mentor", "", `_Last generated: ${generated}. Public platform knowledge only._`, "",
    "## What My Mentor is", "", "My Mentor is a guided growth platform built around books, structured courses, chapters, lessons, reflection, journaling, and daily action. It helps people move from survival into purpose through clear guidance, steady structure, and honest support.", "",
    "## Core approach", "", "- Truth: clear and direct without shaming.", "- Structure: a steady sequence of courses, chapters, lessons, and actions.", "- Care: humane, honest, and safe support.", "",
    "## What members can do", "", "- Explore published articles and reflections.", "- Register and sign in to a member dashboard.", "- Follow published courses and lessons at their own pace.", "- Record private journal entries, mood check-ins, and lesson progress in their account.", "- Apply to become an author and submit articles for editorial review.", "",
    "## Important boundaries", "", "My Mentor is not emergency, medical, legal, or clinical care. Do not diagnose, prescribe, or invent platform policies. For immediate danger or risk of harm, direct the person to local emergency services or an appropriate crisis service. Do not claim to access a member's account or private information unless authorised account context was supplied by the application.", "",
    "## Public routes", "", "- Home: /", "- Articles: /#articles", "- About My Mentor: /about", "- Register: /register", "- Sign in: /login", "- Author application: /authors-register",
  ]);
  save("craig.md", [
    "# Craig and My Mentor", "", `_Last generated: ${generated}. Verified public profile information only._`, "",
    "## Role", "", "Craig is the owner and builder of My Mentor. The AI assistant is not Craig and must never claim to be him.", "",
    "## Publicly stated purpose", "", "Craig built My Mentor on the belief that people heal when truth is clear, structure is steady, and support is honest. The platform expresses that conviction through guided courses, daily action, and practical support.", "",
    "## Published material", "", "The platform presents material by Craig Petersen, including the Uprooting Drug Abuse course and the From Addicts to Leaders guidance book.", "",
    "## Values connected to the platform", "", "- Truth and structure", "- Daily action", "- Humane care", "- Trust, care, and service", "",
    "## Safe usage", "", "Use this information only to explain Craig's public role and the intent behind My Mentor. Do not invent biographical details, qualifications, contact details, medical expertise, personal history, or opinions not included here.",
  ]);

  const courseLines = ["# Published My Mentor Course and Guidance Books", "", `_Last generated: ${generated}. Published learning-material information._`, "", `- Total published full courses: ${fullCourses.length}`, `- Total published guidance books: ${guidanceBooks.length}`, "", "Uprooting Drug Abuse is My Mentor's full course. From Addicts to Leaders and Protecting the Next Generation are guidance books, not full courses.", ""];
  const chapterLines = ["# Published My Mentor Course and Guidance Book Chapters", "", `_Last generated: ${generated}. Published chapter-level information._`, "", "My Mentor has 1 full course (Uprooting Drug Abuse) and 2 guidance books (From Addicts to Leaders and Protecting the Next Generation). Chapters under a guidance book belong to that book; they do not make it a full course.", ""];
  const lessonLines = ["# Published My Mentor Course and Guidance Book Lessons", "", `_Last generated: ${generated}. All stored content blocks for published lessons._`, "", "My Mentor has 1 full course (Uprooting Drug Abuse) and 2 guidance books (From Addicts to Leaders and Protecting the Next Generation). Lessons under a guidance book belong to that book; they do not make it a full course.", ""];

  for (const course of publicCourses) {
    const courseVersions = ordered(versionsByCourse.get(course.id) ?? []);
    const materialType = fullCourses.some((item) => item.id === course.id) ? "Full course" : "Guidance book";
    courseLines.push(`## ${materialType}: ${course.title}`, "", `- Slug: ${course.slug}`, `- Description: ${materialDescription(course.description, materialType)}`, `- Published ${materialType === "Full course" ? "versions" : "book editions"}: ${courseVersions.length}`, "");
    chapterLines.push(`## ${materialType}: ${course.title}`, "");
    lessonLines.push(`## ${materialType}: ${course.title}`, "");
    for (const version of courseVersions) {
      const courseChapters = ordered(chaptersByVersion.get(version.id) ?? []);
      const courseLessons = courseChapters.flatMap((chapter) => lessonsByChapter.get(chapter.id) ?? []);
      courseLines.push(`### ${version.title}`, "", `- Guidance path: ${copy(version.guidance_path)}`, `- Description: ${materialDescription(version.description, materialType)}`, `- Chapters: ${courseChapters.length}`, `- Lessons: ${courseLessons.length}`, "");
      chapterLines.push(`### ${version.title}`, "");
      lessonLines.push(`### ${version.title}`, "");
      for (const chapter of courseChapters) {
        const chapterLessons = ordered(lessonsByChapter.get(chapter.id) ?? [], "lesson_number");
        chapterLines.push(`#### Chapter ${chapter.sort_order ?? "?"}: ${chapter.title}`, "", copy(chapter.description), "", `- Lessons: ${chapterLessons.length}`, "");
        lessonLines.push(`#### Chapter ${chapter.sort_order ?? "?"}: ${chapter.title}`, "");
        for (const lesson of chapterLessons) {
          const lessonBlocks = ordered(blocksByLesson.get(lesson.id) ?? []);
          lessonLines.push(`##### Lesson ${lesson.lesson_number ?? lesson.sort_order ?? "?"}: ${lesson.title}`, "", `- Description: ${copy(lesson.description)}`, `- Estimated minutes: ${lesson.estimated_minutes ?? "Not provided"}`, `- Opening message: ${copy(lesson.opening_message)}`, `- Encouragement message: ${copy(lesson.encouragement_message)}`, "", "###### Content blocks", "");
          if (!lessonBlocks.length) lessonLines.push("No content blocks are stored for this lesson.", "");
          for (const block of lessonBlocks) lessonLines.push(`- Block ${block.sort_order ?? "?"} - ${block.block_type}`, "", "```json", JSON.stringify(block.content ?? {}, null, 2), "```", "");
        }
      }
    }
  }

  save("courses.md", courseLines);
  save("chapters.md", chapterLines);
  save("lessons.md", lessonLines);
  console.log(`Generated knowledge files for ${fullCourses.length} full course, ${guidanceBooks.length} guidance books, ${publicChapters.length} chapters, ${publicLessons.length} lessons, and ${publicBlocks.length} lesson content blocks.`);
}

main().catch((error) => {
  console.error(`Knowledge generation failed: ${error.message}`);
  process.exit(1);
});
