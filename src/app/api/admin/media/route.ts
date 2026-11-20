import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/guards";
import { audioSlug, christianAudioChapters, normalizeAudioTitle } from "@/lib/audio/christian-course";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasTrustedOrigin } from "@/lib/security";

const BUCKET = "media";
const extensions = new Set(["mp3", "m4a", "wav", "ogg", "aac", "webm"]);
const audioMimeTypes = ["audio/mpeg", "audio/mp4", "audio/x-m4a", "audio/wav", "audio/x-wav", "audio/ogg", "audio/aac", "audio/webm"];

function markdownToSpeech(markdown: string) {
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

function markdownSections(markdown: string) {
  const matches = [...markdown.matchAll(/^\s*(?:\*\*)?Lesson\s+\d+\s*:?[ \t]*(.*?)(?:\*\*)?\s*$/gim)];
  return matches.map((match, index) => {
    const start = match.index ?? 0;
    const end = matches[index + 1]?.index ?? markdown.length;
    const number = Number(match[0].match(/Lesson\s+(\d+)/i)?.[1] ?? index + 1);
    const title = (match[1] || `Lesson ${number}`).replace(/[*_`]/g, "").trim();
    return { number, title, text: markdownToSpeech(markdown.slice(start + match[0].length, end)) };
  }).filter((section) => section.text);
}

async function sectionHash(title: string, text: string, voiceId: string) {
  const input = new TextEncoder().encode(`${title}\n${text}\n${voiceId}`);
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", input));
  return Array.from(digest, (byte) => byte.toString(16).padStart(2, "0")).join("").slice(0, 12);
}

export async function POST(request: Request) {
  if (!hasTrustedOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  const actor = await requireAdminSession();
  if (!actor.user || actor.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "Admin data service is unavailable." }, { status: 503 });

  if (request.headers.get("content-type")?.includes("multipart/form-data")) {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File) || !file.name.toLowerCase().endsWith(".md")) return NextResponse.json({ error: "Choose a Markdown (.md) file." }, { status: 400 });
    if (file.size > 2 * 1024 * 1024) return NextResponse.json({ error: "Markdown files must be smaller than 2 MB." }, { status: 400 });
    const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
    const voiceId = process.env.ELEVENLABS_VOICE_ID?.trim();
    if (!apiKey || !voiceId) return NextResponse.json({ error: "ElevenLabs API key and voice ID are not configured." }, { status: 503 });
    const guidancePath = String(form.get("guidancePath") ?? "").trim().toLowerCase();
    if (!new Set(["christian", "religious"]).has(guidancePath)) return NextResponse.json({ error: "Choose Christian or Religious guidance. No credits used." }, { status: 400 });
    const guidanceLabel = guidancePath === "christian" ? "Christian" : "Religious";
    const documentTitle = file.name.replace(/\.md$/i, "").trim();

    const markdown = await file.text();
    const sections = markdownSections(markdown);
    if (!sections.length) return NextResponse.json({ error: "No Lesson sections found in the Markdown file." }, { status: 400 });
    const christianChapter = guidancePath === "christian"
      ? christianAudioChapters.find((chapter) => normalizeAudioTitle(chapter.lessons[0]) === normalizeAudioTitle(sections[0].title))
      : undefined;
    if (guidancePath === "christian" && !christianChapter) return NextResponse.json({ error: "This document does not match a Christian course chapter. No credits used." }, { status: 400 });
    if (christianChapter && sections.length !== christianChapter.lessons.length) return NextResponse.json({ error: `Chapter ${christianChapter.number} requires ${christianChapter.lessons.length} lessons; found ${sections.length}. No credits used.` }, { status: 400 });
    if (sections.some((section, index) => section.number !== index + 1)) return NextResponse.json({ error: "Lesson numbering must be sequential. No credits used." }, { status: 400 });

    const bucket = await admin.storage.getBucket(BUCKET);
    if (bucket.error) {
      const created = await admin.storage.createBucket(BUCKET, { public: false, allowedMimeTypes: audioMimeTypes });
      if (created.error) return NextResponse.json({ error: `Audio storage is unavailable. No ElevenLabs credits used. ${created.error.message}` }, { status: 503 });
    }
    const mediaCheck = await admin.from("mentor_media").select("id").limit(1);
    if (mediaCheck.error) return NextResponse.json({ error: `Audio library is unavailable. No ElevenLabs credits used. ${mediaCheck.error.message}` }, { status: 503 });
    const voiceCheck = await fetch(`https://api.elevenlabs.io/v1/voices/${encodeURIComponent(voiceId)}`, { headers: { "xi-api-key": apiKey } });
    if (!voiceCheck.ok) return NextResponse.json({ error: `ElevenLabs key or voice check failed (${voiceCheck.status}). No generation credits used.` }, { status: 503 });

    let generated = 0;
    let skipped = 0;
    for (const section of sections) {
      const canonicalTitle = christianChapter?.lessons[section.number - 1] ?? section.title;
      const hash = await sectionHash(canonicalTitle, section.text, voiceId);
      const chapterFolder = christianChapter
        ? `chapter-${String(christianChapter.number).padStart(2, "0")}-${audioSlug(christianChapter.title)}`
        : audioSlug(documentTitle);
      const filename = `lesson-${String(section.number).padStart(2, "0")}-${audioSlug(canonicalTitle)}-${hash}.mp3`;
      const folder = `audio/generated/${guidancePath}/${chapterFolder}`;
      const path = `${folder}/${filename}`;
      const trackTitle = christianChapter
        ? `Christian · Chapter ${christianChapter.number}: ${christianChapter.title} · Lesson ${section.number}: ${canonicalTitle}`
        : `${guidanceLabel} · ${documentTitle} · Lesson ${section.number}: ${canonicalTitle}`;
      const existing = await admin.from("mentor_media").select("id").eq("media_type", "audio").eq("media_url", path).maybeSingle();
      if (existing.error) return NextResponse.json({ error: `Could not check existing audio. Generated ${generated}; skipped ${skipped}. ${existing.error.message}` }, { status: 500 });
      if (existing.data) {
        skipped += 1;
        continue;
      }
      const stored = await admin.storage.from(BUCKET).list(folder, { search: filename, limit: 10 });
      if (stored.error) return NextResponse.json({ error: `Could not check stored audio. Generated ${generated}; skipped ${skipped}. ${stored.error.message}` }, { status: 500 });
      if (stored.data.some((item) => item.name === filename)) {
        const recovered = await admin.from("mentor_media").insert({ id: crypto.randomUUID(), media_type: "audio", title: trackTitle, media_url: path });
        if (recovered.error) return NextResponse.json({ error: `Stored audio exists but its library record could not be recovered. ${recovered.error.message}` }, { status: 500 });
        skipped += 1;
        continue;
      }
      const elevenResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}?output_format=mp3_44100_128`, {
        method: "POST",
        headers: { "xi-api-key": apiKey, "Content-Type": "application/json" },
        body: JSON.stringify({ text: section.text, model_id: "eleven_multilingual_v2" }),
      });
      if (!elevenResponse.ok) {
        const detail = await elevenResponse.text().catch(() => "");
        return NextResponse.json({ error: `ElevenLabs failed for Lesson ${section.number}: ${canonicalTitle} (${elevenResponse.status}). Generated ${generated}; skipped ${skipped}.${detail ? ` ${detail.slice(0, 240)}` : ""}` }, { status: 502 });
      }
      const audio = new Uint8Array(await elevenResponse.arrayBuffer());
      const upload = await admin.storage.from(BUCKET).upload(path, audio, { contentType: "audio/mpeg", upsert: false });
      if (upload.error) {
        return NextResponse.json({ error: `Storage failed after generating Lesson ${section.number}: ${canonicalTitle}. Generated ${generated}; skipped ${skipped}. ${upload.error.message}` }, { status: 500 });
      }
      const mediaId = crypto.randomUUID();
      const result = await admin.from("mentor_media").insert({ id: mediaId, media_type: "audio", title: trackTitle, media_url: path });
      if (result.error) {
        return NextResponse.json({ error: `Audio was generated and preserved at ${path}, but its library record failed. ${result.error.message}` }, { status: 500 });
      }
      generated += 1;
    }
    return NextResponse.json({ ok: true, count: sections.length, generated, skipped });
  }

  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const action = typeof body?.action === "string" ? body.action : "";

  if (action === "createUpload") {
    const filename = typeof body?.filename === "string" ? body.filename : "";
    const extension = filename.split(".").pop()?.toLowerCase() ?? "";
    if (!extensions.has(extension)) return NextResponse.json({ error: "Choose an MP3, M4A, WAV, OGG, AAC, or WebM audio file." }, { status: 400 });
    const path = `audio/${crypto.randomUUID()}.${extension}`;
    const signed = await admin.storage.from(BUCKET).createSignedUploadUrl(path);
    if (signed.error) return NextResponse.json({ error: signed.error.message }, { status: 400 });
    return NextResponse.json({ path, token: signed.data.token });
  }

  if (action === "create") {
    const title = typeof body?.title === "string" ? body.title.trim().slice(0, 180) : "";
    const path = typeof body?.path === "string" ? body.path.trim() : "";
    if (!title || !path.startsWith("audio/") || path.includes("..")) return NextResponse.json({ error: "Invalid audio record." }, { status: 400 });
    const result = await admin.from("mentor_media").insert({ id: crypto.randomUUID(), media_type: "audio", title, media_url: path });
    if (result.error) {
      await admin.storage.from(BUCKET).remove([path]);
      return NextResponse.json({ error: result.error.message }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  }

  if (action === "delete") {
    const id = typeof body?.id === "string" ? body.id : "";
    const lookup = await admin.from("mentor_media").select("media_url").eq("id", id).eq("media_type", "audio").maybeSingle();
    if (lookup.error || !lookup.data) return NextResponse.json({ error: lookup.error?.message ?? "Audio not found." }, { status: 404 });
    const deleted = await admin.from("mentor_media").delete().eq("id", id).eq("media_type", "audio");
    if (deleted.error) return NextResponse.json({ error: deleted.error.message }, { status: 400 });
    if (lookup.data.media_url && !/^https?:\/\//i.test(lookup.data.media_url)) await admin.storage.from(BUCKET).remove([lookup.data.media_url]);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unsupported action." }, { status: 400 });
}
