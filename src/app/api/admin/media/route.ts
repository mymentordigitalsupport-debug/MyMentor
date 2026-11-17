import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/guards";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasTrustedOrigin } from "@/lib/security";

const BUCKET = "media";
const extensions = new Set(["mp3", "m4a", "wav", "ogg", "aac", "webm"]);

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

    const speechText = markdownToSpeech(await file.text());
    if (!speechText) return NextResponse.json({ error: "The Markdown file has no readable text." }, { status: 400 });
    const elevenResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}?output_format=mp3_44100_128`, {
      method: "POST",
      headers: { "xi-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({ text: speechText, model_id: "eleven_multilingual_v2" }),
    });
    if (!elevenResponse.ok) {
      const detail = await elevenResponse.text().catch(() => "");
      return NextResponse.json({ error: `ElevenLabs failed (${elevenResponse.status}).${detail ? ` ${detail.slice(0, 240)}` : ""}` }, { status: 502 });
    }

    const path = `audio/generated/${crypto.randomUUID()}.mp3`;
    const audio = new Uint8Array(await elevenResponse.arrayBuffer());
    const upload = await admin.storage.from(BUCKET).upload(path, audio, { contentType: "audio/mpeg", upsert: false });
    if (upload.error) return NextResponse.json({ error: upload.error.message }, { status: 500 });
    const title = String(form.get("title") ?? file.name.replace(/\.md$/i, "")).trim().slice(0, 180) || "Generated audio";
    const result = await admin.from("mentor_media").insert({ id: crypto.randomUUID(), media_type: "audio", title, media_url: path });
    if (result.error) {
      await admin.storage.from(BUCKET).remove([path]);
      return NextResponse.json({ error: result.error.message }, { status: 400 });
    }
    return NextResponse.json({ ok: true, title });
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
