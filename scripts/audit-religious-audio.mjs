import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import nextEnv from "@next/env";
import { createClient } from "@supabase/supabase-js";
import { curlFetch, markdownToSpeech } from "./generate-christian-audio.mjs";
import { normalizeAudioTitle } from "../src/lib/audio/christian-course.ts";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

function required(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

function parseSections(markdown) {
  const matches = [...markdown.matchAll(/^\s*(?:\*\*)?Lesson\s*:?\s*(\d+)\s*:?[ \t]*(.*?)(?:\*\*)?\s*$/gim)];
  return matches.map((match, index) => {
    const start = match.index ?? 0;
    const end = matches[index + 1]?.index ?? markdown.length;
    return {
      line: markdown.slice(0, start).split(/\r?\n/).length,
      number: Number(match[1]),
      title: (match[2] || "").replace(/[*_`]/g, "").trim(),
      text: markdownToSpeech(markdown.slice(start + match[0].length, end)),
    };
  });
}

function titleSimilarity(left, right) {
  const a = normalizeAudioTitle(left);
  const b = normalizeAudioTitle(right);
  if (a === b) return 1;
  const previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i += 1) {
    let diagonal = previous[0];
    previous[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const above = previous[j];
      previous[j] = Math.min(previous[j] + 1, previous[j - 1] + 1, diagonal + (a[i - 1] === b[j - 1] ? 0 : 1));
      diagonal = above;
    }
  }
  return 1 - previous[b.length] / Math.max(a.length, b.length, 1);
}

function wordSet(value) {
  return new Set(value.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((word) => word.length > 3));
}

function jaccard(left, right) {
  const a = wordSet(left);
  const b = wordSet(right);
  let intersection = 0;
  for (const word of a) if (b.has(word)) intersection += 1;
  return intersection / Math.max(1, a.size + b.size - intersection);
}

function bodyHash(value) {
  return createHash("sha256").update(value.toLowerCase().replace(/\s+/g, " ").trim()).digest("hex");
}

async function loadLiveCourse(db) {
  const course = await db.from("courses").select("id").eq("slug", "uprooting-drug-abuse").single();
  if (course.error) throw course.error;
  const version = await db.from("course_versions").select("id").eq("course_id", course.data.id).eq("guidance_path", "religious").single();
  if (version.error) throw version.error;
  const chapters = await db.from("chapters").select("id,title,sort_order").eq("course_version_id", version.data.id).order("sort_order");
  if (chapters.error) throw chapters.error;
  const lessons = await db.from("lessons").select("id,chapter_id,title,sort_order").in("chapter_id", chapters.data.map((chapter) => chapter.id)).order("sort_order");
  if (lessons.error) throw lessons.error;
  const blocks = await db.from("lesson_content_blocks").select("lesson_id,content").in("lesson_id", lessons.data.map((lesson) => lesson.id)).eq("block_type", "reading");
  if (blocks.error) throw blocks.error;
  return chapters.data.map((chapter) => ({
    ...chapter,
    lessons: lessons.data.filter((lesson) => lesson.chapter_id === chapter.id).sort((a, b) => a.sort_order - b.sort_order).map((lesson) => ({
      ...lesson,
      reading: blocks.data.find((block) => block.lesson_id === lesson.id)?.content?.body ?? "",
    })),
  }));
}

function bestChapter(sections, chapters) {
  return chapters.map((chapter) => {
    const comparable = sections.filter((section) => section.text && chapter.lessons[section.number - 1]);
    const score = comparable.reduce((sum, section) => sum + titleSimilarity(section.title, chapter.lessons[section.number - 1].title), 0) / Math.max(1, comparable.length);
    return { chapter, score };
  }).sort((left, right) => right.score - left.score)[0];
}

async function main() {
  const db = createClient(required("NEXT_PUBLIC_SUPABASE_URL"), required("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: curlFetch },
  });
  const chapters = await loadLiveCourse(db);
  const sourceDirectory = path.join(process.cwd(), "public", "text to audio books");
  const files = [];
  for (const filename of (await readdir(sourceDirectory)).filter((name) => name.toLowerCase().endsWith(".md")).sort()) {
    const markdown = await readFile(path.join(sourceDirectory, filename), "utf8");
    const sections = parseSections(markdown);
    const match = bestChapter(sections, chapters);
    files.push({ filename, sections, ...match });
  }

  console.log(`LIVE|chapters=${chapters.length}|lessons=${chapters.reduce((sum, chapter) => sum + chapter.lessons.length, 0)}`);
  let populatedTotal = 0;
  for (const file of files) {
    const populated = file.sections.filter((section) => section.text);
    populatedTotal += populated.length;
    const expectedNumbers = file.chapter.lessons.map((lesson) => lesson.sort_order);
    const actualNumbers = populated.map((section) => section.number);
    const missing = expectedNumbers.filter((number) => !actualNumbers.includes(number));
    const extras = actualNumbers.filter((number) => !expectedNumbers.includes(number));
    const empty = file.sections.filter((section) => !section.text).map((section) => `${section.number}@${section.line}`);
    const repeated = actualNumbers.filter((number, index) => actualNumbers.indexOf(number) !== index);
    const contentScores = populated.map((section) => ({ number: section.number, score: jaccard(section.text, file.chapter.lessons[section.number - 1]?.reading ?? "") }));
    const averageContentScore = contentScores.reduce((sum, item) => sum + item.score, 0) / Math.max(1, contentScores.length);
    const lowestContentScore = contentScores.sort((left, right) => left.score - right.score)[0];
    console.log(`FILE|${file.filename}|chapter=${file.chapter.sort_order}:${file.chapter.title}|title_score=${file.score.toFixed(3)}|content_score=${averageContentScore.toFixed(3)}|lowest=L${lowestContentScore?.number ?? 0}:${lowestContentScore?.score.toFixed(3) ?? "0.000"}|populated=${populated.length}/${file.chapter.lessons.length}|missing=${missing.join(",") || "none"}|extra=${extras.join(",") || "none"}|empty=${empty.join(",") || "none"}|repeated=${[...new Set(repeated)].join(",") || "none"}`);
    for (const section of populated) {
      const expected = file.chapter.lessons[section.number - 1];
      if (!expected) continue;
      if (normalizeAudioTitle(section.title) !== normalizeAudioTitle(expected.title)) {
        console.log(`TITLE|${file.filename}|L${section.number}|local=${section.title}|live=${expected.title}|score=${titleSimilarity(section.title, expected.title).toFixed(3)}`);
      }
      const contentScore = jaccard(section.text, expected.reading);
      if (contentScore < 0.08) {
        console.log(`LOW_CONTENT|${file.filename}|L${section.number}|score=${contentScore.toFixed(3)}|local=${section.text.slice(0, 220)}|live=${expected.reading.slice(0, 220)}`);
      }
    }
  }

  const assigned = files.map((file) => file.chapter.sort_order);
  const duplicateChapters = assigned.filter((number, index) => assigned.indexOf(number) !== index);
  const missingChapters = chapters.map((chapter) => chapter.sort_order).filter((number) => !assigned.includes(number));
  const sections = files.flatMap((file) => file.sections.filter((section) => section.text).map((section) => ({ ...section, filename: file.filename })));
  const exactBodies = [];
  const exactTitles = [];
  const nearBodies = [];
  for (let left = 0; left < sections.length; left += 1) {
    for (let right = left + 1; right < sections.length; right += 1) {
      const a = sections[left];
      const b = sections[right];
      const sameBody = bodyHash(a.text) === bodyHash(b.text);
      if (sameBody) exactBodies.push(`${a.filename}:L${a.number}=${b.filename}:L${b.number}`);
      if (normalizeAudioTitle(a.title) === normalizeAudioTitle(b.title)) exactTitles.push(`${a.filename}:L${a.number}=${b.filename}:L${b.number}:${a.title}`);
      const similarity = jaccard(a.text, b.text);
      if (similarity >= 0.8 && !sameBody) nearBodies.push(`${a.filename}:L${a.number}~${b.filename}:L${b.number}:${similarity.toFixed(3)}`);
    }
  }
  console.log(`SUMMARY|files=${files.length}|populated=${populatedTotal}|missing_chapters=${missingChapters.join(",") || "none"}|duplicate_chapters=${[...new Set(duplicateChapters)].join(",") || "none"}|exact_body_duplicates=${exactBodies.length}|near_body_duplicates=${nearBodies.length}|duplicate_titles=${exactTitles.length}`);
  for (const item of exactBodies) console.log(`DUPLICATE_BODY|${item}`);
  for (const item of nearBodies) console.log(`NEAR_BODY|${item}`);
  for (const item of exactTitles) console.log(`DUPLICATE_TITLE|${item}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
