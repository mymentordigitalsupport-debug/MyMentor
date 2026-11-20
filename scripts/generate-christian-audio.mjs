import { createHash, randomUUID } from "node:crypto";
import { spawn } from "node:child_process";
import { setDefaultResultOrder } from "node:dns";
import { existsSync } from "node:fs";
import { mkdir, mkdtemp, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import nextEnv from "@next/env";
import { createClient } from "@supabase/supabase-js";
import { audioSlug, christianAudioChapters, normalizeAudioTitle } from "../src/lib/audio/christian-course.ts";

const { loadEnvConfig } = nextEnv;
setDefaultResultOrder("ipv4first");
const root = process.cwd();
loadEnvConfig(root);

const BUCKET = "media";
const sourceDirectory = path.join(root, "public", "text to audio books");
const backupDirectory = path.join(root, "generated-audio", "christian");
const shouldGenerate = process.argv.includes("--generate");
const shouldVerify = process.argv.includes("--verify");

function curlConfigValue(value) {
  return String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

export async function curlFetch(input, init) {
  const request = new Request(input, init);
  const temp = await mkdtemp(path.join(tmpdir(), "mymentor-audio-fetch-"));
  const headersPath = path.join(temp, "headers.txt");
  const outputPath = path.join(temp, "output.bin");
  const bodyPath = path.join(temp, "body.bin");
  const curlPath = (value) => value.replace(/\\/g, "/");

  try {
    const config = [
      `url = "${curlConfigValue(request.url)}"`,
      `request = "${request.method}"`,
      "silent",
      "show-error",
      "location",
      "max-time = 180",
      `dump-header = "${curlPath(headersPath)}"`,
      `output = "${curlPath(outputPath)}"`,
      'write-out = "%{http_code}"',
    ];
    for (const [name, value] of request.headers) config.push(`header = "${curlConfigValue(`${name}: ${value}`)}"`);
    if (request.method !== "GET" && request.method !== "HEAD") {
      await writeFile(bodyPath, Buffer.from(await request.arrayBuffer()));
      config.push(`data-binary = "@${curlPath(bodyPath)}"`);
    }

    const result = await new Promise((resolve, reject) => {
      const child = spawn("curl.exe", ["--config", "-"], { stdio: ["pipe", "pipe", "pipe"] });
      const stdout = [];
      const stderr = [];
      child.stdout.on("data", (chunk) => stdout.push(chunk));
      child.stderr.on("data", (chunk) => stderr.push(chunk));
      child.on("error", reject);
      child.on("close", (code) => code === 0
        ? resolve(Buffer.concat(stdout).toString("utf8"))
        : reject(new Error(Buffer.concat(stderr).toString("utf8").trim() || `curl exited ${code}`)));
      child.stdin.end(`${config.join("\n")}\n`);
    });

    const status = Number(String(result).trim().slice(-3));
    const body = existsSync(outputPath) ? await readFile(outputPath) : Buffer.alloc(0);
    const rawHeaders = existsSync(headersPath) ? await readFile(headersPath, "utf8") : "";
    const headerBlocks = rawHeaders.split(/\r?\n\r?\n/).filter((block) => /^HTTP\//i.test(block));
    const responseHeaders = new Headers();
    for (const line of (headerBlocks.at(-1) ?? "").split(/\r?\n/).slice(1)) {
      const separator = line.indexOf(":");
      if (separator > 0) responseHeaders.append(line.slice(0, separator).trim(), line.slice(separator + 1).trim());
    }
    return new Response([204, 205, 304].includes(status) ? null : body, { status, headers: responseHeaders });
  } finally {
    await rm(temp, { recursive: true, force: true });
  }
}

export function markdownToSpeech(markdown) {
  return markdown
    .replace(/^---[\s\S]*?---\s*/m, "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*\d+[.)]\s+/gm, "")
    .replace(/[*_~`]/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function markdownSections(markdown) {
  const matches = [...markdown.matchAll(/^\s*(?:\*\*)?Lesson\s+\d+\s*:?[ \t]*(.*?)(?:\*\*)?\s*$/gim)];
  return matches.map((match, index) => {
    const start = match.index ?? 0;
    const end = matches[index + 1]?.index ?? markdown.length;
    const number = Number(match[0].match(/Lesson\s+(\d+)/i)?.[1] ?? index + 1);
    const title = (match[1] || `Lesson ${number}`).replace(/[*_`]/g, "").trim();
    return { number, title, text: markdownToSpeech(markdown.slice(start + match[0].length, end)) };
  }).filter((section) => section.text);
}

function requireEnvironment(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing ${name}. No credits used.`);
  return value;
}

export function sectionHash(title, text, voiceId) {
  return createHash("sha256").update(`${title}\n${text}\n${voiceId}`).digest("hex").slice(0, 12);
}

export async function buildPlan() {
  const filenames = (await readdir(sourceDirectory)).filter((filename) => filename.toLowerCase().endsWith(".md"));
  if (filenames.length !== christianAudioChapters.length) throw new Error(`Expected 11 Markdown files; found ${filenames.length}. No credits used.`);

  const plan = [];
  for (const filename of filenames) {
    const markdown = await readFile(path.join(sourceDirectory, filename), "utf8");
    const sections = markdownSections(markdown);
    const chapter = christianAudioChapters.find((item) => normalizeAudioTitle(item.lessons[0]) === normalizeAudioTitle(sections[0]?.title ?? ""));
    if (!chapter) throw new Error(`${filename} does not match a Christian chapter. No credits used.`);
    if (sections.length !== chapter.lessons.length) throw new Error(`${filename}: expected ${chapter.lessons.length} lessons; found ${sections.length}. No credits used.`);
    if (sections.some((section, index) => section.number !== index + 1)) throw new Error(`${filename}: lesson numbering is not sequential. No credits used.`);
    plan.push({ filename, chapter, sections });
  }

  plan.sort((left, right) => left.chapter.number - right.chapter.number);
  const numbers = plan.map((item) => item.chapter.number);
  if (new Set(numbers).size !== christianAudioChapters.length) throw new Error("Duplicate or missing Christian chapters. No credits used.");
  return plan;
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

async function addTrack(db, title, remotePath) {
  const inserted = await db.from("mentor_media").insert({ id: randomUUID(), media_type: "audio", title, media_url: remotePath });
  if (inserted.error) throw new Error(`Audio preserved at ${remotePath}, but database insert failed: ${inserted.error.message}`);
}

async function uploadBackup(db, localPath, remotePath, title) {
  const audio = await readFile(localPath);
  const uploaded = await db.storage.from(BUCKET).upload(remotePath, audio, { contentType: "audio/mpeg", upsert: false });
  if (uploaded.error) throw new Error(`Local backup preserved at ${localPath}, but upload failed: ${uploaded.error.message}`);
  await addTrack(db, title, remotePath);
}

export function expectedAudio(plan, voiceId) {
  return plan.flatMap((item) => {
    const chapterFolder = `chapter-${String(item.chapter.number).padStart(2, "0")}-${audioSlug(item.chapter.title)}`;
    return item.sections.map((section) => {
      const canonicalTitle = item.chapter.lessons[section.number - 1];
      const hash = sectionHash(canonicalTitle, section.text, voiceId);
      const filename = `lesson-${String(section.number).padStart(2, "0")}-${audioSlug(canonicalTitle)}-${hash}.mp3`;
      const remoteFolder = `audio/generated/christian/${chapterFolder}`;
      return {
        chapterFolder,
        filename,
        remoteFolder,
        remotePath: `${remoteFolder}/${filename}`,
        localPath: path.join(backupDirectory, chapterFolder, filename),
        transcript: section.text,
        title: `Christian · Chapter ${item.chapter.number}: ${item.chapter.title} · Lesson ${section.number}: ${canonicalTitle}`,
      };
    });
  });
}

async function verifyAudio(db, plan, voiceId) {
  const expected = expectedAudio(plan, voiceId);
  const media = await db.from("mentor_media").select("title,media_url").eq("media_type", "audio").like("media_url", "audio/generated/christian/%");
  if (media.error) throw new Error(`Verification failed reading mentor_media: ${media.error.message}`);
  const mediaMap = new Map(media.data.map((item) => [item.media_url, item.title]));

  const adminView = await db.from("audio_tracks").select("title,url").like("url", "audio/generated/christian/%");
  if (adminView.error) throw new Error(`Verification failed reading audio_tracks: ${adminView.error.message}`);
  const viewMap = new Map(adminView.data.map((item) => [item.url, item.title]));

  const storageNames = new Set();
  for (const item of plan) {
    const chapterFolder = `chapter-${String(item.chapter.number).padStart(2, "0")}-${audioSlug(item.chapter.title)}`;
    const remoteFolder = `audio/generated/christian/${chapterFolder}`;
    const listed = await db.storage.from(BUCKET).list(remoteFolder, { limit: 100 });
    if (listed.error) throw new Error(`Verification failed listing ${remoteFolder}: ${listed.error.message}`);
    for (const file of listed.data) storageNames.add(`${remoteFolder}/${file.name}`);
  }

  for (const item of expected) {
    if (mediaMap.get(item.remotePath) !== item.title) throw new Error(`mentor_media mismatch: ${item.title}`);
    if (viewMap.get(item.remotePath) !== item.title) throw new Error(`audio_tracks mismatch: ${item.title}`);
    if (!storageNames.has(item.remotePath)) throw new Error(`Storage object missing: ${item.remotePath}`);
    const file = await stat(item.localPath).catch(() => null);
    if (!file || file.size === 0) throw new Error(`Local backup missing or empty: ${item.localPath}`);
  }

  console.log(`Verified: ${expected.length} database records, admin records, storage objects, and local backups.`);
}

async function main() {
  const apiKey = requireEnvironment("ELEVENLABS_API_KEY");
  const voiceId = requireEnvironment("ELEVENLABS_VOICE_ID");
  const supabaseUrl = requireEnvironment("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = requireEnvironment("SUPABASE_SERVICE_ROLE_KEY");
  const plan = await buildPlan();
  const total = plan.reduce((sum, item) => sum + item.sections.length, 0);
  if (total !== 87) throw new Error(`Expected 87 lessons; found ${total}. No credits used.`);

  const db = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: curlFetch },
  });
  const voiceName = await ensureRemoteReady(db, apiKey, voiceId);
  console.log(`Preflight passed: 11 chapters, ${total} lessons, voice ${voiceName}.`);
  if (!shouldGenerate) {
    if (shouldVerify) await verifyAudio(db, plan, voiceId);
    console.log("Dry run only. Use --generate to create audio.");
    return;
  }

  let generated = 0;
  let skipped = 0;
  let recovered = 0;
  for (const item of plan) {
    const chapterFolder = `chapter-${String(item.chapter.number).padStart(2, "0")}-${audioSlug(item.chapter.title)}`;
    for (const section of item.sections) {
      const canonicalTitle = item.chapter.lessons[section.number - 1];
      const hash = sectionHash(canonicalTitle, section.text, voiceId);
      const filename = `lesson-${String(section.number).padStart(2, "0")}-${audioSlug(canonicalTitle)}-${hash}.mp3`;
      const remoteFolder = `audio/generated/christian/${chapterFolder}`;
      const remotePath = `${remoteFolder}/${filename}`;
      const localFolder = path.join(backupDirectory, chapterFolder);
      const localPath = path.join(localFolder, filename);
      const title = `Christian · Chapter ${item.chapter.number}: ${item.chapter.title} · Lesson ${section.number}: ${canonicalTitle}`;

      const existing = await db.from("mentor_media").select("id").eq("media_type", "audio").eq("media_url", remotePath).maybeSingle();
      if (existing.error) throw new Error(`Audio lookup failed: ${existing.error.message}`);
      if (existing.data) {
        skipped += 1;
        console.log(`[${generated + skipped + recovered}/${total}] Skip: ${title}`);
        continue;
      }

      if (await storageFileExists(db, remoteFolder, filename)) {
        await addTrack(db, title, remotePath);
        recovered += 1;
        console.log(`[${generated + skipped + recovered}/${total}] Recover database: ${title}`);
        continue;
      }

      if (existsSync(localPath)) {
        await uploadBackup(db, localPath, remotePath, title);
        recovered += 1;
        console.log(`[${generated + skipped + recovered}/${total}] Recover local backup: ${title}`);
        continue;
      }

      const response = await curlFetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}?output_format=mp3_44100_128`, {
        method: "POST",
        headers: { "xi-api-key": apiKey, "Content-Type": "application/json" },
        body: JSON.stringify({ text: section.text, model_id: "eleven_multilingual_v2" }),
        signal: AbortSignal.timeout(120000),
      });
      if (!response.ok) {
        const detail = await response.text().catch(() => "");
        throw new Error(`ElevenLabs failed for ${title} (${response.status}). ${detail.slice(0, 240)}`);
      }

      const audio = Buffer.from(await response.arrayBuffer());
      await mkdir(localFolder, { recursive: true });
      await writeFile(localPath, audio);
      await uploadBackup(db, localPath, remotePath, title);
      generated += 1;
      console.log(`[${generated + skipped + recovered}/${total}] Generated: ${title}`);
    }
  }

  console.log(`Complete: generated ${generated}, recovered ${recovered}, skipped ${skipped}, total ${total}.`);
  await verifyAudio(db, plan, voiceId);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
