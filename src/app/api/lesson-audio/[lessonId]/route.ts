import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const BUCKET = "media";
const AUDIO_PREFIXES = ["audio/generated/christian/", "audio/generated/religious/"];

export async function GET(request: Request, { params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: lesson } = await supabase
    .from("lessons")
    .select("id,chapter_id")
    .eq("id", lessonId)
    .maybeSingle();
  if (!lesson?.chapter_id) return NextResponse.json({ error: "Audio not found" }, { status: 404 });

  const { data: chapter } = await supabase
    .from("chapters")
    .select("course_version_id")
    .eq("id", lesson.chapter_id)
    .maybeSingle();
  if (!chapter?.course_version_id) return NextResponse.json({ error: "Audio not found" }, { status: 404 });

  const { data: entitlements } = await supabase
    .from("course_entitlements")
    .select("access_level,chapter_id")
    .eq("user_id", user.id)
    .eq("course_version_id", chapter.course_version_id)
    .eq("active", true);
  const allowed = (entitlements ?? []).some((item) => item.access_level === "full_course" || item.chapter_id === lesson.chapter_id);
  if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { data: audioBlock } = await supabase
    .from("lesson_content_blocks")
    .select("content")
    .eq("lesson_id", lessonId)
    .eq("block_type", "audio")
    .maybeSingle();
  const content = audioBlock?.content as Record<string, unknown> | undefined;
  const storagePath = typeof content?.storage_path === "string" ? content.storage_path : "";
  if (!AUDIO_PREFIXES.some((prefix) => storagePath.startsWith(prefix)) || storagePath.includes("..")) return NextResponse.json({ error: "Audio not found" }, { status: 404 });

  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "Audio unavailable" }, { status: 503 });
  const downloaded = await admin.storage.from(BUCKET).download(storagePath);
  if (downloaded.error || !downloaded.data) return NextResponse.json({ error: "Audio unavailable" }, { status: 503 });

  const bytes = new Uint8Array(await downloaded.data.arrayBuffer());
  const range = request.headers.get("range");
  const baseHeaders = {
    "Accept-Ranges": "bytes",
    "Cache-Control": "private, no-store, max-age=0",
    "Content-Disposition": "inline",
    "Content-Type": "audio/mpeg",
    "X-Content-Type-Options": "nosniff",
  };
  if (!range) return new Response(bytes, { headers: { ...baseHeaders, "Content-Length": String(bytes.byteLength) } });

  const match = /^bytes=(\d*)-(\d*)$/i.exec(range.trim());
  if (!match) return new Response(null, { status: 416, headers: { ...baseHeaders, "Content-Range": `bytes */${bytes.byteLength}` } });
  const start = match[1] ? Number(match[1]) : 0;
  const requestedEnd = match[2] ? Number(match[2]) : bytes.byteLength - 1;
  const end = Math.min(requestedEnd, bytes.byteLength - 1);
  if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start < 0 || start > end || start >= bytes.byteLength) {
    return new Response(null, { status: 416, headers: { ...baseHeaders, "Content-Range": `bytes */${bytes.byteLength}` } });
  }
  const chunk = bytes.slice(start, end + 1);
  return new Response(chunk, {
    status: 206,
    headers: {
      ...baseHeaders,
      "Content-Length": String(chunk.byteLength),
      "Content-Range": `bytes ${start}-${end}/${bytes.byteLength}`,
    },
  });
}
