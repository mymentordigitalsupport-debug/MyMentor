import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/guards";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasTrustedOrigin } from "@/lib/security";

const tableByType = { course: "courses", chapter: "chapters", lesson: "lessons" } as const;

export async function PATCH(request: Request) {
  if (!hasTrustedOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  const actor = await requireAdminSession();
  if (!actor.user || actor.role !== "admin") return NextResponse.json({ error: "Administrator access required." }, { status: 403 });
  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "Admin data service is unavailable." }, { status: 503 });
  const body = await request.json().catch(() => null) as { type?: keyof typeof tableByType; id?: string; title?: string; description?: string; estimatedMinutes?: number; published?: boolean } | null;
  if (!body) return NextResponse.json({ error: "Invalid content payload." }, { status: 400 });
  const table = body.type ? tableByType[body.type] : undefined;
  const id = typeof body.id === "string" ? body.id : "";
  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (!table || !id || !title) return NextResponse.json({ error: "Content type, ID, and title are required." }, { status: 400 });
  const values: Record<string, unknown> = { title, updated_at: new Date().toISOString() };
  if (body.type !== "lesson") values.description = typeof body.description === "string" ? body.description.trim() || null : null;
  if (body.type === "lesson" && typeof body.estimatedMinutes === "number") values.estimated_minutes = Math.max(1, Math.min(999, Math.round(body.estimatedMinutes)));
  if (typeof body.published === "boolean") {
    values.is_published = body.published;
    values.status = body.published ? "published" : "draft";
  }
  const { error } = await admin.from(table).update(values).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
