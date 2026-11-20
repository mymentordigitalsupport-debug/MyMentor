import nextEnv from "@next/env";
import { createClient } from "@supabase/supabase-js";
import { christianAudioChapters, normalizeAudioTitle } from "../src/lib/audio/christian-course.ts";
import { curlFetch } from "./generate-christian-audio.mjs";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

function required(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

async function main() {
  const db = createClient(required("NEXT_PUBLIC_SUPABASE_URL"), required("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: curlFetch },
  });

  const course = await db.from("courses").select("id").eq("slug", "uprooting-drug-abuse").single();
  if (course.error) throw course.error;
  const version = await db.from("course_versions").select("id").eq("course_id", course.data.id).eq("guidance_path", "christian").single();
  if (version.error) throw version.error;
  const chapters = await db.from("chapters").select("id,title,sort_order").eq("course_version_id", version.data.id).order("sort_order");
  if (chapters.error) throw chapters.error;
  if (chapters.data.length !== 11) throw new Error(`Expected 11 chapters; found ${chapters.data.length}`);

  const lessons = await db.from("lessons").select("id,chapter_id,title,sort_order").in("chapter_id", chapters.data.map((chapter) => chapter.id)).order("sort_order");
  if (lessons.error) throw lessons.error;
  if (lessons.data.length !== 87) throw new Error(`Expected 87 lessons; found ${lessons.data.length}`);

  const blocks = await db.from("lesson_content_blocks").select("id,lesson_id,block_type,content").in("lesson_id", lessons.data.map((lesson) => lesson.id)).in("block_type", ["video", "audio"]);
  if (blocks.error) throw blocks.error;
  const tracks = await db.from("mentor_media").select("title,media_url").eq("media_type", "audio").like("media_url", "audio/generated/christian/%");
  if (tracks.error) throw tracks.error;
  const trackMap = new Map(tracks.data.map((track) => [track.title, track.media_url]));

  let changed = 0;
  for (const chapterManifest of christianAudioChapters) {
    const chapter = chapters.data.find((item) => item.sort_order === chapterManifest.number);
    if (!chapter || chapter.title !== chapterManifest.title) throw new Error(`Chapter ${chapterManifest.number} mismatch`);
    const chapterLessons = lessons.data.filter((lesson) => lesson.chapter_id === chapter.id).sort((a, b) => a.sort_order - b.sort_order);
    if (chapterLessons.length !== chapterManifest.lessons.length) throw new Error(`Chapter ${chapterManifest.number} lesson count mismatch`);

    for (let index = 0; index < chapterLessons.length; index += 1) {
      const lesson = chapterLessons[index];
      const lessonNumber = index + 1;
      const canonicalTitle = chapterManifest.lessons[index];
      if (normalizeAudioTitle(lesson.title) !== normalizeAudioTitle(canonicalTitle) || lesson.sort_order !== lessonNumber) throw new Error(`Chapter ${chapterManifest.number}, lesson ${lessonNumber} mismatch`);
      const title = `Christian · Chapter ${chapterManifest.number}: ${chapterManifest.title} · Lesson ${lessonNumber}: ${canonicalTitle}`;
      const storagePath = trackMap.get(title);
      if (!storagePath) throw new Error(`Audio track missing: ${title}`);
      const candidates = blocks.data.filter((block) => block.lesson_id === lesson.id);
      if (candidates.length !== 1) throw new Error(`${title} has ${candidates.length} video/audio blocks`);
      const block = candidates[0];
      const content = block.content ?? {};
      if (block.block_type === "audio" && content.storage_path === storagePath && content.title === canonicalTitle) continue;
      const updated = await db.from("lesson_content_blocks").update({
        block_type: "audio",
        content: { title: canonicalTitle, storage_path: storagePath },
      }).eq("id", block.id);
      if (updated.error) throw updated.error;
      changed += 1;
      console.log(`[${changed}] Attached: ${title}`);
    }
  }

  const verified = await db.from("lesson_content_blocks").select("id,lesson_id,block_type,content").in("lesson_id", lessons.data.map((lesson) => lesson.id)).eq("block_type", "audio");
  if (verified.error) throw verified.error;
  if (verified.data.length !== 87) throw new Error(`Verification expected 87 audio blocks; found ${verified.data.length}`);
  if (verified.data.some((block) => typeof block.content?.storage_path !== "string" || !block.content.storage_path.startsWith("audio/generated/christian/"))) {
    throw new Error("Verification found an invalid audio storage path");
  }
  console.log(`Verified: 87 Christian lessons now use protected audio blocks. Changed ${changed}.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
