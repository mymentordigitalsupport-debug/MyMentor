import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireAdminSession } from "@/lib/admin/guards";
import { hasTrustedOrigin } from "@/lib/security";
import { notifyPaymentChange } from "@/lib/payment-email";

const ACTIONS = new Set(["approve", "reject", "needs_resubmission"]);

export async function POST(request: Request, { params }: { params: Promise<{ paymentId: string }> }) {
  if (!hasTrustedOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  const { user, role } = await requireAdminSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  const { paymentId } = await params;
  const body = await request.json().catch(() => null) as { action?: unknown; note?: unknown } | null;
  const action = typeof body?.action === "string" ? body.action : "";
  if (!ACTIONS.has(action)) return NextResponse.json({ error: "Invalid review action." }, { status: 400 });
  const note = typeof body?.note === "string" ? body.note.trim().slice(0, 1000) : "";
  if (action !== "approve" && !note) return NextResponse.json({ error: "Add a reason so the member knows what to do next." }, { status: 400 });
  const { data, error } = await admin.rpc("review_manual_payment", { p_payment_id: paymentId, p_actor_id: user.id, p_action: action, p_note: note || null });
  if (error) return NextResponse.json({ error: error.message }, { status: error.message.includes("not found") ? 404 : 409 });
  await notifyPaymentChange(admin, paymentId, action === "approve" ? "paymentApproved" : action === "reject" ? "paymentRejected" : "paymentNeedsResubmission");
  return NextResponse.json({ ok: true, ...(data as Record<string, unknown>) });
}
