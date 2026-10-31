import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { queueAdminNotification, queueUserEmail } from "@/lib/transactional-email";
import { NextResponse } from "next/server";

function safeNext(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/today";
  return value;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNext(searchParams.get("next"));

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();
      const admin = createSupabaseAdminClient();
      if (user && admin) {
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
        if (profile?.role === "user") {
          try {
            await queueUserEmail(admin, { userId: user.id, eventKey: `member-welcome:${user.id}`, eventType: "member_welcome", template: "memberWelcome" });
          } catch {
            console.error("[transactional-email] callback welcome queue failed", { userId: user.id });
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
            console.error("[transactional-email] callback admin member notification queue failed", { userId: user.id });
          }
        }
      }
      return NextResponse.redirect(new URL(next, origin));
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
