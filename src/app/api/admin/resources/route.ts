import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireAdminSession } from "@/lib/admin/guards";
import { hasTrustedOrigin } from "@/lib/security";

const BUCKET = "resources";
const categories = new Set(["reading", "worksheet", "support"]);
const allowedExtensions = new Set(["pdf", "doc", "docx", "ppt", "pptx", "xls", "xlsx", "txt"]);

function safeCategory(value: unknown) {
  return typeof value === "string" && categories.has(value) ? value : "reading";
}

function resourceType(category: string) {
  return category === "worksheet" ? "worksheet" : category === "support" ? "support" : "article";
}

async function authorize(request: Request) {
  if (!hasTrustedOrigin(request)) return { error: NextResponse.json({ error: "Invalid request origin." }, { status: 403 }) };
  const actor = await requireAdminSession();
  if (!actor.user || actor.role !== "admin") return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  const admin = createSupabaseAdminClient();
  if (!admin) return { error: NextResponse.json({ error: "Admin data service is unavailable." }, { status: 503 }) };
  return { admin };
}

export async function POST(request: Request) {
  const auth = await authorize(request);
  if ("error" in auth) return auth.error;
  const { admin } = auth;

  if (request.headers.get("content-type")?.includes("multipart/form-data")) {
    const form = await request.formData();
    const file = form.get("file");
    const title = String(form.get("title") ?? "").trim().slice(0, 180);
    const description = String(form.get("description") ?? "").trim().slice(0, 500);
    const category = safeCategory(form.get("category"));
    if (!(file instanceof File) || !title || file.size < 1 || file.size > 25 * 1024 * 1024) return NextResponse.json({ error: "Choose a document under 25 MB and enter a title." }, { status: 400 });
    const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!allowedExtensions.has(extension)) return NextResponse.json({ error: "Unsupported document type." }, { status: 400 });
    const path = `documents/${crypto.randomUUID()}.${extension}`;
    const upload = await admin.storage.from(BUCKET).upload(path, file, { contentType: file.type || undefined, upsert: false });
    if (upload.error) return NextResponse.json({ error: upload.error.message }, { status: 400 });
    const insert = await admin.from("resources").insert({ title, description: description || null, category, resource_type: resourceType(category), file_url: path, is_published: false, status: "draft", sort_order: 0 });
    if (insert.error) {
      await admin.storage.from(BUCKET).remove([path]);
      return NextResponse.json({ error: insert.error.message }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  }

  const input = await request.json().catch(() => null) as Record<string, unknown> | null;
  const resourceId = typeof input?.resourceId === "string" ? input.resourceId.trim() : "";
  const path = typeof input?.path === "string" ? input.path.trim() : "";
  const action = typeof input?.action === "string" ? input.action : "save";
  if (path.includes("..")) return NextResponse.json({ error: "Invalid storage path." }, { status: 400 });

  if (action === "delete") {
    if (!resourceId && path) {
      const removed = await admin.storage.from(BUCKET).remove([path]);
      if (removed.error) return NextResponse.json({ error: removed.error.message }, { status: 400 });
      return NextResponse.json({ ok: true });
    }
    if (!resourceId) return NextResponse.json({ error: "Resource ID required." }, { status: 400 });
    const lookup = await admin.from("resources").select("file_url").eq("id", resourceId).maybeSingle();
    if (lookup.error) return NextResponse.json({ error: lookup.error.message }, { status: 400 });
    const deleted = await admin.from("resources").delete().eq("id", resourceId);
    if (deleted.error) return NextResponse.json({ error: deleted.error.message }, { status: 400 });
    if (lookup.data?.file_url && !/^https?:\/\//i.test(lookup.data.file_url)) await admin.storage.from(BUCKET).remove([lookup.data.file_url]);
    return NextResponse.json({ ok: true });
  }

  const title = typeof input?.title === "string" ? input.title.trim().slice(0, 180) : "";
  const description = typeof input?.description === "string" ? input.description.trim().slice(0, 500) : "";
  const category = safeCategory(input?.category);
  const isPublished = input?.isPublished === true;
  const sortOrder = Number.isFinite(Number(input?.sortOrder)) ? Math.max(0, Math.round(Number(input?.sortOrder))) : 0;
  if (!title || (!resourceId && !path)) return NextResponse.json({ error: "Enter a title for a valid resource." }, { status: 400 });
  const values = { title, description: description || null, category, resource_type: resourceType(category), is_published: isPublished, status: isPublished ? "published" : "draft", sort_order: sortOrder, updated_at: new Date().toISOString() };
  const result = resourceId
    ? await admin.from("resources").update(values).eq("id", resourceId)
    : await admin.from("resources").insert({ ...values, file_url: path });
  if (result.error) return NextResponse.json({ error: result.error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
