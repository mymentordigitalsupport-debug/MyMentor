import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { deliverTransactionalEmail } from "@/lib/transactional-email";

async function retry(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "Email service is unavailable." }, { status: 503 });
  const { data, error } = await admin.from("transactional_email_events").select("event_key").in("status", ["queued", "failed", "sending"]).lte("next_attempt_at", new Date().toISOString()).order("created_at").limit(20);
  if (error) return NextResponse.json({ error: "Unable to load pending email events." }, { status: 500 });
  const results = await Promise.all((data ?? []).map((event) => deliverTransactionalEmail(admin, event.event_key).catch(() => false)));
  return NextResponse.json({ attempted: results.length, delivered: results.filter(Boolean).length });
}

export const GET = retry;
export const POST = retry;
