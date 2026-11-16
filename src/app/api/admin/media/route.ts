import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/guards";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasTrustedOrigin } from "@/lib/security";

const BUCKET = "media";
const extensions = new Set(["mp3", "m4a", "wav", "ogg", "aac", "webm"]);

export async function POST(request: Request) {
  if (!hasTrustedOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  const actor = await requireAdminSession();
  if (!actor.user || actor.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "Admin data service is unavailable." }, { status: 503 });
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
