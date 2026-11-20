import nextEnv from "@next/env";
import { createClient } from "@supabase/supabase-js";
import { curlFetch } from "./generate-christian-audio.mjs";
import { buildReligiousPlan, expectedReligiousAudio } from "./generate-religious-audio.mjs";

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
  const plan = await buildReligiousPlan(db);
  const items = expectedReligiousAudio(plan, required("ELEVENLABS_VOICE_ID"));
  const lessonIds = items.map((item) => item.lessonId);
  const blocks = await db.from("lesson_content_blocks").select("id,lesson_id,block_type,content").in("lesson_id", lessonIds).in("block_type", ["video", "audio"]);
  if (blocks.error) throw blocks.error;
  const tracks = await db.from("mentor_media").select("title,media_url").eq("media_type", "audio").like("media_url", "audio/generated/religious/%");
  if (tracks.error) throw tracks.error;
  const trackMap = new Map(tracks.data.map((track) => [track.title, track.media_url]));

  let changed = 0;
  for (const item of items) {
    const storagePath = trackMap.get(item.title);
    if (storagePath !== item.remotePath) throw new Error(`Audio track mismatch: ${item.title}`);
    const candidates = blocks.data.filter((block) => block.lesson_id === item.lessonId);
    if (candidates.length !== 1) throw new Error(`${item.title} has ${candidates.length} video/audio blocks`);
    const block = candidates[0];
    const content = block.content ?? {};
    if (block.block_type === "audio" && content.storage_path === storagePath && content.title === item.lessonTitle) continue;
    const updated = await db.from("lesson_content_blocks").update({
      block_type: "audio",
      content: { title: item.lessonTitle, storage_path: storagePath },
    }).eq("id", block.id);
    if (updated.error) throw updated.error;
    changed += 1;
    console.log(`[${changed}/87] Attached: ${item.title}`);
  }

  const verified = await db.from("lesson_content_blocks").select("id,lesson_id,block_type,content").in("lesson_id", lessonIds).eq("block_type", "audio");
  if (verified.error) throw verified.error;
  if (verified.data.length !== 87) throw new Error(`Verification expected 87 audio blocks; found ${verified.data.length}`);
  if (verified.data.some((block) => typeof block.content?.storage_path !== "string" || !block.content.storage_path.startsWith("audio/generated/religious/"))) {
    throw new Error("Verification found an invalid Religious audio storage path");
  }
  console.log(`Verified: 87 Religious lessons now use protected audio blocks. Changed ${changed}.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
