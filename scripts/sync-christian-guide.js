// Applies a validated Guided migration payload to the connected Supabase project.
// Idempotent: chapter, lesson, and content-block IDs are retained.
const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const root = path.resolve(__dirname, "..");
const guidancePath = process.argv[2] || "christian";
if (!["christian", "religious"].includes(guidancePath)) throw new Error("Invalid guidance path");
const migration = guidancePath === "religious"
  ? "20261023000000_update_religious_guided_content.sql"
  : "20261022000000_update_christian_guided_content.sql";
const sql = fs.readFileSync(path.join(root, "supabase/migrations", migration), "utf8");
const match = sql.match(/jsonb_array_elements\('([\s\S]*?)'::jsonb\)/);
if (!match) throw new Error("Migration payload missing");
const chapters = JSON.parse(match[1].replace(/''/g, "'"));
const env = Object.fromEntries(fs.readFileSync(path.join(root, ".env.local"), "utf8")
  .split(/\r?\n/).filter(Boolean).map(line => {
    const split = line.indexOf("=");
    return [line.slice(0, split), line.slice(split + 1)];
  }));
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } });

function checked(result, context) {
  if (result.error) throw new Error(`${context}: ${result.error.message}`);
  return result.data;
}

async function runBatch(items, action, size = 6) {
  for (let index = 0; index < items.length; index += size) {
    await Promise.all(items.slice(index, index + size).map(action));
    console.log(`Updated ${Math.min(index + size, items.length)}/${items.length} lessons`);
  }
}

async function main() {
  const course = checked(await db.from("courses").select("id").eq("slug", "uprooting-drug-abuse").single(), "course");
  const version = checked(await db.from("course_versions").select("id").eq("course_id", course.id)
    .eq("guidance_path", guidancePath).single(), "version");
  const liveChapters = checked(await db.from("chapters").select("id,title,sort_order").eq("course_version_id", version.id), "chapters");
  if (chapters.length !== 11 || liveChapters.length !== 11) throw new Error("Expected 11 chapters");
  const oldTitles = { "The Stages of Drug Abuse": "The Three Stages of Drug Abuse" };
  const chapterPairs = chapters.map(chapter => {
    const originalOrder = guidancePath === "religious" ? ({ 8: 9, 9: 10, 10: 8 }[chapter.number] || chapter.number) : null;
    const live = guidancePath === "religious"
      ? liveChapters.find(item => item.title === chapter.title) || liveChapters.find(item => item.sort_order === originalOrder)
      : liveChapters.find(item => item.title === chapter.title || item.title === oldTitles[chapter.title]);
    if (!live) throw new Error(`Missing chapter ${chapter.title}`);
    return { chapter, live };
  });
  const liveLessons = checked(await db.from("lessons").select("id,chapter_id,lesson_number")
    .in("chapter_id", liveChapters.map(item => item.id)), "lessons");
  const lessonPairs = chapterPairs.flatMap(({ chapter, live }) => chapter.lessons.map(lesson => {
    const found = liveLessons.find(item => item.chapter_id === live.id && item.lesson_number === lesson.number);
    if (!found) throw new Error(`Missing lesson ${chapter.title}/${lesson.number}`);
    return { lesson, live: found };
  }));
  if (lessonPairs.length !== 87 || liveLessons.length !== 87) throw new Error("Expected 87 lessons");
  if (new Set(chapterPairs.map(pair => pair.live.id)).size !== 11 ||
      new Set(lessonPairs.map(pair => pair.live.id)).size !== 87) throw new Error("Non-unique course mapping");
  const liveBlocks = checked(await db.from("lesson_content_blocks").select("id,lesson_id,sort_order")
    .in("lesson_id", liveLessons.map(item => item.id)).range(0, 1999), "blocks");
  for (const { live } of lessonPairs) {
    const positions = liveBlocks.filter(item => item.lesson_id === live.id).map(item => item.sort_order);
    if (new Set(positions).size !== positions.length || positions.some(position => position < 1)) {
      throw new Error(`Unexpected existing block positions for lesson ${live.id}`);
    }
  }
  console.log(`Validated live records: ${liveChapters.length} chapters, ${liveLessons.length} lessons, ${liveBlocks.length} blocks`);

  for (const { chapter, live } of chapterPairs) {
    checked(await db.from("chapters").update({ title: chapter.title, description: chapter.description,
      sort_order: chapter.number, updated_at: new Date().toISOString() }).eq("id", live.id), `chapter ${chapter.number}`);
  }
  await runBatch(lessonPairs, async ({ lesson, live }) => {
    checked(await db.from("lessons").update({ title: lesson.title, estimated_minutes: lesson.minutes,
      opening_message: lesson.blocks[0].content.message,
      encouragement_message: lesson.blocks[12].content.encouragement,
      sort_order: lesson.number, updated_at: new Date().toISOString() }).eq("id", live.id), `lesson ${live.id}`);
    const existing = [], missing = [];
    lesson.blocks.forEach((block, index) => {
      const position = index + 1;
      const row = liveBlocks.find(item => item.lesson_id === live.id && item.sort_order === position);
      const payload = { lesson_id: live.id, block_type: block.type, content: block.content, sort_order: position };
      if (row) existing.push({ id: row.id, ...payload, updated_at: new Date().toISOString() });
      else missing.push(payload);
    });
    if (existing.length) checked(await db.from("lesson_content_blocks").upsert(existing, { onConflict: "id" }), `blocks ${live.id}`);
    if (missing.length) checked(await db.from("lesson_content_blocks").insert(missing), `new blocks ${live.id}`);
    const obsoleteIds = liveBlocks.filter(item => item.lesson_id === live.id && item.sort_order > lesson.blocks.length)
      .map(item => item.id);
    if (obsoleteIds.length) checked(await db.from("lesson_content_blocks").delete().in("id", obsoleteIds), `obsolete blocks ${live.id}`);
  });
  console.log(`${guidancePath} Guided course sync complete`);
}

main().catch(error => { console.error(error.message); process.exitCode = 1; });
