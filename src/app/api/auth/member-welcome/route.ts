import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { queueUserEmail } from "@/lib/transactional-email";

export async function POST() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const admin = createSupabaseAdminClient();
  if (!user || !admin) return NextResponse.json({ success: true });
  try {
    await queueUserEmail(admin, { userId: user.id, eventKey: `member-welcome:${user.id}`, eventType: "member_welcome", template: "memberWelcome" });
  } catch {
    console.error("[transactional-email] member welcome queue failed", { userId: user.id });
  }
  return NextResponse.json({ success: true });
}
