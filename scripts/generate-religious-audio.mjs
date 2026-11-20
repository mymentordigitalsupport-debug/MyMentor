import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import nextEnv from "@next/env";
import { createClient } from "@supabase/supabase-js";
import { audioSlug, normalizeAudioTitle } from "../src/lib/audio/christian-course.ts";
import { curlFetch, markdownSections, sectionHash } from "./generate-christian-audio.mjs";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

const BUCKET = "media";
const sourceDirectory = path.join(process.cwd(), "public", "text to audio books");
const backupDirectory = path.join(process.cwd(), "generated-audio", "religious");
const shouldGenerate = process.argv.includes("--generate");
const shouldVerify = process.argv.includes("--verify");

function required(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing ${name}. No credits used.`);
  return value;
}

async function loadCourse(db) {
  const course = await db.from("courses").select("id").eq("slug", "uprooting-drug-abuse").single();
  if (course.error) throw course.error;
  const version = await db.from("course_versions").select("id").eq("course_id", course.data.id).eq("guidance_path", "religious").single();
  if (version.error) throw version.error;
  const chapters = await db.from("chapters").select("id,title,sort_order").eq("course_version_id", version.data.id).order("sort_order");
  if (chapters.error) throw chapters.error;
  const lessons = await db.from("lessons").select("id,chapter_id,title,sort_order").in("chapter_id", chapters.data.map((chapter) => chapter.id)).order("sort_order");
  if (lessons.error) throw lessons.error;
  return chapters.data.map((chapter) => ({
    ...chapter,
    lessons: lessons.data.filter((lesson) => lesson.chapter_id === chapter.id).sort((a, b) => a.sort_order - b.sort_order),
  }));
}

export async function buildReligiousPlan(db) {
  const chapters = await loadCourse(db);
  if (chapters.length !== 11) throw new Error(`Expected 11 live Religious chapters; found ${chapters.length}. No credits used.`);
  const filenames = (await readdir(sourceDirectory)).filter((filename) => filename.toLowerCase().endsWith(".md"));
  if (filenames.length !== chapters.length) throw new Error(`Expected 11 Religious Markdown files; found ${filenames.length}. No credits used.`);

  const documents = [];
  for (const filename of filenames) {
    const sections = markdownSections(await readFile(path.join(sourceDirectory, filename), "utf8"));
    documents.push({ filename, sections });
  }

  const usedFiles = new Set();
  const plan = chapters.map((chapter) => {
    const document = documents.find((candidate) =>
      !usedFiles.has(candidate.filename)
      && candidate.sections.length === chapter.lessons.length
      && candidate.sections.every((section, index) =>
        section.number === index + 1
        && normalizeAudioTitle(section.title) === normalizeAudioTitle(chapter.lessons[index].title)
      )
    );
    if (!document) throw new Error(`No exact Markdown match for Chapter ${chapter.sort_order}: ${chapter.title}. No credits used.`);
    usedFiles.add(document.filename);
    return { chapter, ...document };
  });
  if (usedFiles.size !== filenames.length) throw new Error("Duplicate or unmatched Religious Markdown files. No credits used.");
  const total = plan.reduce((sum, item) => sum + item.sections.length, 0);
  if (total !== 87) throw new Error(`Expected 87 Religious lessons; found ${total}. No credits used.`);
  return plan;
}

export function expectedReligiousAudio(plan, voiceId) {
  return plan.flatMap((item) => {
    const chapterFolder = `chapter-${String(item.chapter.sort_order).padStart(2, "0")}-${audioSlug(item.chapter.title)}`;
    return item.sections.map((section, index) => {
      const lesson = item.chapter.lessons[index];
      const hash = sectionHash(lesson.title, section.text, voiceId);
      const filename = `lesson-${String(lesson.sort_order).padStart(2, "0")}-${audioSlug(lesson.title)}-${hash}.mp3`;
      const remoteFolder = `audio/generated/religious/${chapterFolder}`;
      return {
        chapterId: item.chapter.id,
        chapterNumber: item.chapter.sort_order,
        chapterTitle: item.chapter.title,
        lessonId: lesson.id,
        lessonNumber: lesson.sort_order,
        lessonTitle: lesson.title,
        filename,
        remoteFolder,
        remotePath: `${remoteFolder}/${filename}`,
        localPath: path.join(backupDirectory, chapterFolder, filename),
        transcript: section.text,
        title: `Religious · Chapter ${item.chapter.sort_order}: ${item.chapter.title} · Lesson ${lesson.sort_order}: ${lesson.title}`,
      };
    });
  });
}

async function ensureRemoteReady(db, apiKey, voiceId) {
  const bucket = await db.storage.getBucket(BUCKET);
  if (bucket.error) {
    const created = await db.storage.createBucket(BUCKET, {
      public: false,
      allowedMimeTypes: ["audio/mpeg", "audio/mp4", "audio/x-m4a", "audio/wav", "audio/x-wav", "audio/ogg", "audio/aac", "audio/webm"],
    });
    if (created.error) throw new Error(`Supabase bucket unavailable: ${created.error.message}. No credits used.`);
  }
  const table = await db.from("mentor_media").select("id").limit(1);
  if (table.error) throw new Error(`Supabase audio library unavailable: ${table.error.message}. No credits used.`);
  const voiceResponse = await curlFetch(`https://api.elevenlabs.io/v1/voices/${encodeURIComponent(voiceId)}`, {
    headers: { "xi-api-key": apiKey },
    signal: AbortSignal.timeout(30000),
  });
  if (!voiceResponse.ok) throw new Error(`ElevenLabs voice check failed (${voiceResponse.status}). No credits used.`);
  const voice = await voiceResponse.json();
  return voice.name ?? voiceId;
}

async function storageFileExists(db, folder, filename) {
  const stored = await db.storage.from(BUCKET).list(folder, { search: filename, limit: 10 });
  if (stored.error) throw new Error(`Storage lookup failed: ${stored.error.message}`);
  return stored.data.some((item) => item.name === filename);
}

async function addTrack(db, item) {
  const inserted = await db.from("mentor_media").insert({ id: randomUUID(), media_type: "audio", title: item.title, media_url: item.remotePath });
  if (inserted.error) throw new Error(`Audio preserved at ${item.remotePath}, but database insert failed: ${inserted.error.message}`);
}

async function uploadBackup(db, item) {
  const audio = await readFile(item.localPath);
  const uploaded = await db.storage.from(BUCKET).upload(item.remotePath, audio, { contentType: "audio/mpeg", upsert: false });
  if (uploaded.error) throw new Error(`Local backup preserved at ${item.localPath}, but upload failed: ${uploaded.error.message}`);
  await addTrack(db, item);
}

async function verifyAudio(db, items) {
  const media = await db.from("mentor_media").select("title,media_url").eq("media_type", "audio").like("media_url", "audio/generated/religious/%");
  if (media.error) throw new Error(`Verification failed reading mentor_media: ${media.error.message}`);
  const mediaMap = new Map(media.data.map((item) => [item.media_url, item.title]));
  const adminView = await db.from("audio_tracks").select("title,url").like("url", "audio/generated/religious/%");
  if (adminView.error) throw new Error(`Verification failed reading audio_tracks: ${adminView.error.message}`);
  const viewMap = new Map(adminView.data.map((item) => [item.url, item.title]));
  const storageNames = new Set();
  for (const folder of new Set(items.map((item) => item.remoteFolder))) {
    const listed = await db.storage.from(BUCKET).list(folder, { limit: 100 });
    if (listed.error) throw new Error(`Verification failed listing ${folder}: ${listed.error.message}`);
    for (const file of listed.data) storageNames.add(`${folder}/${file.name}`);
  }
  for (const item of items) {
    if (mediaMap.get(item.remotePath) !== item.title) throw new Error(`mentor_media mismatch: ${item.title}`);
    if (viewMap.get(item.remotePath) !== item.title) throw new Error(`audio_tracks mismatch: ${item.title}`);
    if (!storageNames.has(item.remotePath)) throw new Error(`Storage object missing: ${item.remotePath}`);
    const file = await stat(item.localPath).catch(() => null);
    if (!file?.size) throw new Error(`Local backup missing or empty: ${item.localPath}`);
  }
  console.log(`Verified: ${items.length} database records, admin records, storage objects, and local backups.`);
}

async function main() {
  const apiKey = required("ELEVENLABS_API_KEY");
  const voiceId = required("ELEVENLABS_VOICE_ID");
  const db = createClient(required("NEXT_PUBLIC_SUPABASE_URL"), required("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: curlFetch },
  });
  const plan = await buildReligiousPlan(db);
  const items = expectedReligiousAudio(plan, voiceId);
  const voiceName = await ensureRemoteReady(db, apiKey, voiceId);
  console.log(`Preflight passed: 11 unique Religious chapters, 87 exact lessons, voice ${voiceName}.`);
  if (!shouldGenerate) {
    if (shouldVerify) await verifyAudio(db, items);
    console.log("Dry run only. Use --generate to create audio.");
    return;
  }

  let generated = 0;
  let skipped = 0;
  let recovered = 0;
  for (const item of items) {
    const existing = await db.from("mentor_media").select("id").eq("media_type", "audio").eq("media_url", item.remotePath).maybeSingle();
    if (existing.error) throw new Error(`Audio lookup failed: ${existing.error.message}`);
    if (existing.data) {
      skipped += 1;
      console.log(`[${generated + skipped + recovered}/87] Skip: ${item.title}`);
      continue;
    }
    if (await storageFileExists(db, item.remoteFolder, item.filename)) {
      await addTrack(db, item);
      recovered += 1;
      console.log(`[${generated + skipped + recovered}/87] Recover database: ${item.title}`);
      continue;
    }
    if (existsSync(item.localPath)) {
      await uploadBackup(db, item);
      recovered += 1;
      console.log(`[${generated + skipped + recovered}/87] Recover local backup: ${item.title}`);
      continue;
    }

    const response = await curlFetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}?output_format=mp3_44100_128`, {
      method: "POST",
      headers: { "xi-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({ text: item.transcript, model_id: "eleven_multilingual_v2" }),
      signal: AbortSignal.timeout(120000),
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      throw new Error(`ElevenLabs failed for ${item.title} (${response.status}). ${detail.slice(0, 240)}`);
    }
    const audio = Buffer.from(await response.arrayBuffer());
    await mkdir(path.dirname(item.localPath), { recursive: true });
    await writeFile(item.localPath, audio);
    await uploadBackup(db, item);
    generated += 1;
    console.log(`[${generated + skipped + recovered}/87] Generated: ${item.title}`);
  }
  console.log(`Complete: generated ${generated}, recovered ${recovered}, skipped ${skipped}, total 87.`);
  await verifyAudio(db, items);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
