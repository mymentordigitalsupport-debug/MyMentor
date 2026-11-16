import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireAdminSession } from "@/lib/admin/guards";

export async function GET() {
  const { user, role } = await requireAdminSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  const { data, error } = await admin.from("payment_requests").select("id,user_id,product_code,amount_cents,payment_reference,status,user_note,admin_note,submitted_at,created_at,updated_at,payment_proofs(id,storage_path,original_filename,mime_type,file_size,created_at)").neq("status", "pending").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: "Unable to load payments." }, { status: 500 });
  const rows = await Promise.all((data ?? []).map(async (row) => {
    const proofs = Array.isArray(row.payment_proofs) ? [...row.payment_proofs].sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at)) : [];
    const proof = proofs[0] ?? null;
    const signed = proof ? await admin.storage.from("payment_proofs").createSignedUrl(proof.storage_path, 600) : null;
    return { ...row, payment_proofs: proofs, proof_url: signed?.data?.signedUrl ?? null };
  }));
  return NextResponse.json({ payments: rows });
}
