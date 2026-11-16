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
  const { data: proof } = await supabase.from("payment_proofs").select("id").eq("payment_request_id", requestId).eq("user_id", user.id).limit(1);
  if (!proof?.length) return NextResponse.json({ error: "Upload proof of payment first." }, { status: 400 });
  const { data, error } = await supabase.from("payment_requests").update({ status: "under_review", submitted_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("id", requestId).eq("user_id", user.id).in("status", ["pending", "needs_resubmission"]).select("id,status").single();
  if (error || !data) return NextResponse.json({ error: "Payment request cannot be submitted." }, { status: 400 });
  const admin = createSupabaseAdminClient();
  if (admin) await notifyPaymentChange(admin, data.id, "paymentProofReceived");
  return NextResponse.json({ payment: data });
}
