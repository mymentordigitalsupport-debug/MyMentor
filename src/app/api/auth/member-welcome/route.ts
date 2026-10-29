import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { queueAdminNotification, queueUserEmail } from "@/lib/transactional-email";
import { hasTrustedOrigin, takeRateLimit } from "@/lib/security";

export async function POST(request: Request) {
  if (!hasTrustedOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const admin = createSupabaseAdminClient();
  if (!user || !admin) return NextResponse.json({ success: true });
  if (!await takeRateLimit(`member-welcome:${user.id}`, 3600, 3)) return NextResponse.json({ success: true });
  try {
    await queueUserEmail(admin, { userId: user.id, eventKey: `member-welcome:${user.id}`, eventType: "member_welcome", template: "memberWelcome" });
  } catch {
    console.error("[transactional-email] member welcome queue failed", { userId: user.id });
  }
  try {
    await queueAdminNotification(admin, {
      eventKey: `admin-member-registered:${user.id}`,
      eventType: "admin_member_registered",
      title: "New member registration",
      details: `A new member account was registered for ${user.email ?? "an account"}.`,
      pathname: "/admin/users",
    });
  } catch {
    console.error("[transactional-email] admin member notification queue failed", { userId: user.id });
  }
  return NextResponse.json({ success: true });
}
