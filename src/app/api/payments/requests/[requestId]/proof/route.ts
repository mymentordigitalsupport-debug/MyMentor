import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasTrustedOrigin } from "@/lib/security";

const MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(request: Request, { params }: { params: Promise<{ requestId: string }> }) {
  if (!hasTrustedOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  const { requestId } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const { data: payment } = await supabase.from("payment_requests").select("id,status").eq("id", requestId).eq("user_id", user.id).maybeSingle();
  if (!payment || !["pending", "needs_resubmission"].includes(payment.status)) return NextResponse.json({ error: "This payment request cannot receive proof." }, { status: 400 });
  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File) || !MIME_TYPES.has(file.type) || file.size <= 0 || file.size > 5 * 1024 * 1024) return NextResponse.json({ error: "Upload a JPG, PNG, or WebP image up to 5 MB." }, { status: 400 });
  const extension = file.type === "image/jpeg" ? "jpg" : file.type.split("/")[1];
  const path = `${user.id}/${requestId}/${crypto.randomUUID()}.${extension}`;
  const { error: uploadError } = await supabase.storage.from("payment_proofs").upload(path, file, { contentType: file.type, upsert: false });
  if (uploadError) return NextResponse.json({ error: "Unable to upload proof." }, { status: 400 });
  const { error } = await supabase.from("payment_proofs").insert({ payment_request_id: requestId, user_id: user.id, storage_path: path, original_filename: file.name.slice(0, 180), mime_type: file.type, file_size: file.size });
  if (error) { await supabase.storage.from("payment_proofs").remove([path]); return NextResponse.json({ error: "Unable to save proof." }, { status: 500 }); }
  return NextResponse.json({ ok: true });
}
