import { readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import nextEnv from "@next/env";
import { createClient } from "@supabase/supabase-js";
import { buildPlan, curlFetch, expectedAudio } from "./generate-christian-audio.mjs";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

const shouldAlign = process.argv.includes("--align");
const shouldVerify = process.argv.includes("--verify");

function required(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing ${name}. No alignment requests used.`);
  return value;
}

function alignmentPath(audioPath) {
  return audioPath.replace(/\.mp3$/i, ".alignment.json");
}

function cleanAlignment(payload, transcript) {
  const words = Array.isArray(payload?.words)
    ? payload.words.map((word) => ({
        text: String(word?.text ?? ""),
        start: Number(word?.start),
        end: Number(word?.end),
      }))
    : [];
  if (
    words.length === 0
    || words.some((word) => !word.text || !Number.isFinite(word.start) || !Number.isFinite(word.end) || word.start < 0 || word.end < word.start)
    || words.some((word, index) => index > 0 && word.start < words[index - 1].start)
  ) {
    throw new Error("ElevenLabs returned invalid word timestamps.");
  }
  return {
    version: 1,
    transcript,
    words,
    loss: Number.isFinite(Number(payload.loss)) ? Number(payload.loss) : null,
  };
}

function validAlignment(payload, transcript) {
  try {
    if (payload?.transcript !== transcript) return null;
    return cleanAlignment(payload, transcript);
  } catch {
    return null;
  }
}

async function loadLocalAlignment(localPath, transcript) {
  try {
    return validAlignment(JSON.parse(await readFile(localPath, "utf8")), transcript);
  } catch {
    return null;
  }
}

async function loadCourseAudioBlocks(db) {
  const course = await db.from("courses").select("id").eq("slug", "uprooting-drug-abuse").single();
  if (course.error) throw course.error;
  const version = await db.from("course_versions").select("id").eq("course_id", course.data.id).eq("guidance_path", "christian").single();
  if (version.error) throw version.error;
  const chapters = await db.from("chapters").select("id").eq("course_version_id", version.data.id);
  if (chapters.error) throw chapters.error;
  const lessons = await db.from("lessons").select("id").in("chapter_id", chapters.data.map((chapter) => chapter.id));
  if (lessons.error) throw lessons.error;
  const blocks = await db.from("lesson_content_blocks").select("id,content").in("lesson_id", lessons.data.map((lesson) => lesson.id)).eq("block_type", "audio");
  if (blocks.error) throw blocks.error;
  if (blocks.data.length !== 87) throw new Error(`Expected 87 Christian audio blocks; found ${blocks.data.length}. No alignment requests used.`);
  return new Map(blocks.data.map((block) => [block.content?.storage_path, block]));
}

async function requestAlignment(apiKey, item) {
  const audio = await readFile(item.localPath);
  const form = new FormData();
  form.append("file", new Blob([audio], { type: "audio/mpeg" }), path.basename(item.localPath));
  form.append("text", item.transcript);
  const response = await curlFetch("https://api.elevenlabs.io/v1/forced-alignment", {
    method: "POST",
    headers: { "xi-api-key": apiKey },
    body: form,
    signal: AbortSignal.timeout(180000),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Alignment failed for ${item.title} (${response.status}). ${detail.slice(0, 240)}`);
  }
  return cleanAlignment(await response.json(), item.transcript);
}

async function updateBlock(db, block, item, alignment) {
  const updated = await db.from("lesson_content_blocks").update({
    content: {
      ...block.content,
      transcript: item.transcript,
      alignment,
    },
  }).eq("id", block.id);
  if (updated.error) throw new Error(`Alignment saved locally but database update failed for ${item.title}: ${updated.error.message}`);
}

async function main() {
  const apiKey = required("ELEVENLABS_API_KEY");
  const voiceId = required("ELEVENLABS_VOICE_ID");
  const db = createClient(required("NEXT_PUBLIC_SUPABASE_URL"), required("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: curlFetch },
  });
  const plan = await buildPlan();
  const items = expectedAudio(plan, voiceId);
  if (items.length !== 87) throw new Error(`Expected 87 lessons; found ${items.length}. No alignment requests used.`);
  const blockMap = await loadCourseAudioBlocks(db);

  for (const item of items) {
    const audio = await stat(item.localPath).catch(() => null);
    if (!audio?.size) throw new Error(`Missing audio: ${item.localPath}. No alignment requests used.`);
    if (!blockMap.has(item.remotePath)) throw new Error(`Audio block mismatch: ${item.title}. No alignment requests used.`);
  }

  const pending = items.filter((item) => !validAlignment(blockMap.get(item.remotePath)?.content?.alignment, item.transcript));
  console.log(`Preflight passed: 87 existing MP3s, ${pending.length} alignments pending. No audio regeneration path exists in this script.`);
  if (!shouldAlign) {
    if (!shouldVerify) console.log("Dry run only. Use --align to create timestamps.");
  } else {
    let aligned = 0;
    let recovered = 0;
    let skipped = 0;
    for (const item of items) {
      const block = blockMap.get(item.remotePath);
      const existing = validAlignment(block.content?.alignment, item.transcript);
      if (existing) {
        skipped += 1;
        console.log(`[${aligned + recovered + skipped}/87] Skip: ${item.title}`);
        continue;
      }

      const localPath = alignmentPath(item.localPath);
      let alignment = await loadLocalAlignment(localPath, item.transcript);
      if (alignment) {
        recovered += 1;
        console.log(`[${aligned + recovered + skipped}/87] Recover: ${item.title}`);
      } else {
        alignment = await requestAlignment(apiKey, item);
        await writeFile(localPath, `${JSON.stringify(alignment)}\n`, "utf8");
        aligned += 1;
        console.log(`[${aligned + recovered + skipped}/87] Aligned: ${item.title}`);
      }
      await updateBlock(db, block, item, alignment);
      block.content = { ...block.content, transcript: item.transcript, alignment };
    }
    console.log(`Complete: aligned ${aligned}, recovered ${recovered}, skipped ${skipped}. Audio regenerated: 0.`);
  }

  if (shouldVerify || shouldAlign) {
    const freshBlocks = await loadCourseAudioBlocks(db);
    let localCount = 0;
    for (const item of items) {
      const block = freshBlocks.get(item.remotePath);
      if (!block || !validAlignment(block.content?.alignment, item.transcript) || block.content?.transcript !== item.transcript) {
        throw new Error(`Database verification failed: ${item.title}`);
      }
      if (await loadLocalAlignment(alignmentPath(item.localPath), item.transcript)) localCount += 1;
    }
    console.log(`Verified: 87 database alignments, ${localCount} local alignment backups.`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
