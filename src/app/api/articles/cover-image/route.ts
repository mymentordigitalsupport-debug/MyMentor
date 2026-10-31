import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getArticleActor, isApprovedAuthor, isArticleAdmin } from "@/lib/article-access";

const BUCKET = "articles_media";
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const extensions: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

export async function POST(request: Request) {
  const actor = await getArticleActor();
  if (!actor.user || (!isApprovedAuthor(actor.role) && !isArticleAdmin(actor.role))) {
    return NextResponse.json({ error: "Approved author or administrator access is required." }, { status: 403 });
  }

  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "Article image storage is unavailable." }, { status: 503 });

  const formData = await request.formData();
  const image = formData.get("image");
  if (!(image instanceof File) || !image.size) return NextResponse.json({ error: "Choose an image to upload." }, { status: 400 });
  if (!extensions[image.type]) return NextResponse.json({ error: "Use a JPG, PNG, WebP, or AVIF image." }, { status: 400 });
  if (image.size > MAX_IMAGE_SIZE) return NextResponse.json({ error: "Cover images must be 5 MB or smaller." }, { status: 400 });

  const path = `${actor.user.id}/${new Date().toISOString().slice(0, 10)}/${randomUUID()}.${extensions[image.type]}`;
  const { error: uploadError } = await admin.storage.from(BUCKET).upload(path, image, {
    contentType: image.type,
    cacheControl: "31536000",
    upsert: false,
  });
  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 400 });

  const { data } = admin.storage.from(BUCKET).getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl, path }, { status: 201 });
}
