import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasTrustedOrigin } from "@/lib/security";
import { notifyPaymentChange } from "@/lib/payment-email";

export async function POST(request: Request, { params }: { params: Promise<{ requestId: string }> }) {
  if (!hasTrustedOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  const { requestId } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "Payment service is unavailable." }, { status: 503 });

  const { data: payment, error: paymentError } = await admin
    .from("payment_requests")
    .select("id,user_id,status")
    .eq("id", requestId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (paymentError || !payment) return NextResponse.json({ error: "Payment request not found." }, { status: 404 });
  if (!["pending", "needs_resubmission"].includes(payment.status)) {
    return NextResponse.json({ error: "This payment can no longer be cancelled." }, { status: 409 });
  }

  const now = new Date().toISOString();
  const { data: cancelled, error } = await admin
    .from("payment_requests")
    .update({ status: "cancelled", updated_at: now, admin_note: "Cancelled by member." })
    .eq("id", requestId)
    .eq("user_id", user.id)
    .in("status", ["pending", "needs_resubmission"])
    .select("id,status")
    .single();
  if (error || !cancelled) return NextResponse.json({ error: "Payment request could not be cancelled." }, { status: 409 });

  await admin.from("payment_audit_log").insert({
    payment_request_id: requestId,
    actor_id: user.id,
    action: "cancel",
    previous_status: payment.status,
    new_status: "cancelled",
    note: "Cancelled by member.",
  });

  await notifyPaymentChange(admin, cancelled.id, "paymentCancelled");

  return NextResponse.json({ payment: cancelled });
}
