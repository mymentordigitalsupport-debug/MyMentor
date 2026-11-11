import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireAdminSession } from "@/lib/admin/guards";
import { hasTrustedOrigin } from "@/lib/security";

const categories = new Set(["reading", "audio", "video"]);
const resourceTypes = {
  reading: "article",
  audio: "audio",
  video: "video",
} as const;

export async function POST(request: Request) {
  if (!hasTrustedOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  const { user, role } = await requireAdminSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  const input = await request.json().catch(() => null) as Record<string, unknown> | null;
  const resourceId = typeof input?.resourceId === "string" ? input.resourceId.trim() : "";
  const path = typeof input?.path === "string" ? input.path.trim() : "";
  const title = typeof input?.title === "string" ? input.title.trim().slice(0, 180) : "";
  const description = typeof input?.description === "string" ? input.description.trim().slice(0, 500) : "";
  const category = typeof input?.category === "string" && categories.has(input.category)
    ? input.category as keyof typeof resourceTypes
    : "reading";
  if (!title || (!resourceId && (!path || path.includes("..")))) return NextResponse.json({ error: "Enter a title for a valid resource." }, { status: 400 });
  if (resourceId) {
    const { error } = await admin.from("resources").update({ title, description: description || null, updated_at: new Date().toISOString() }).eq("id", resourceId);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  }
  const { data: existing, error: lookupError } = await admin.from("resources").select("id").eq("file_url", path).maybeSingle();
  if (lookupError) return NextResponse.json({ error: lookupError.message }, { status: 400 });
  const resource_type = resourceTypes[category];
  const values = { title, description: description || null, category, resource_type, file_url: path, is_published: true, updated_at: new Date().toISOString() };
  const result = existing ? await admin.from("resources").update(values).eq("id", existing.id) : await admin.from("resources").insert({ ...values, sort_order: 0 });
  if (result.error) return NextResponse.json({ error: result.error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
