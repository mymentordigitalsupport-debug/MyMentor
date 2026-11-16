import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasTrustedOrigin } from "@/lib/security";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { notifyPaymentChange } from "@/lib/payment-email";

export async function POST(request: Request, { params }: { params: Promise<{ requestId: string }> }) {
  if (!hasTrustedOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  const { requestId } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "Payment service is unavailable." }, { status: 503 });
  const { data: payment } = await admin.from("payment_requests").select("id,user_id,status,reviewed_at").eq("id", requestId).eq("user_id", user.id).maybeSingle();
  if (!payment || !["pending", "needs_resubmission"].includes(payment.status)) return NextResponse.json({ error: "This payment request cannot be submitted." }, { status: 409 });
  let proofQuery = admin.from("payment_proofs").select("id,created_at").eq("payment_request_id", requestId).eq("user_id", user.id).order("created_at", { ascending: false }).limit(1);
  if (payment.status === "needs_resubmission" && payment.reviewed_at) proofQuery = proofQuery.gt("created_at", payment.reviewed_at);
  const { data: proof } = await proofQuery.maybeSingle();
  if (!proof) return NextResponse.json({ error: payment.status === "needs_resubmission" ? "Upload a new proof of payment before resubmitting." : "Upload proof of payment first." }, { status: 400 });
  const now = new Date().toISOString();
  const { data, error } = await admin.from("payment_requests").update({ status: "under_review", submitted_at: now, updated_at: now }).eq("id", requestId).eq("user_id", user.id).eq("status", payment.status).select("id,status").single();
  if (error || !data) return NextResponse.json({ error: "Payment request cannot be submitted." }, { status: 400 });
  await notifyPaymentChange(admin, data.id, "paymentProofReceived");
  return NextResponse.json({ payment: data });
}
