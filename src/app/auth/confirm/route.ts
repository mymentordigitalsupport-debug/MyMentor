import type { EmailOtpType } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { queueAdminNotification, queueUserEmail } from "@/lib/transactional-email";

function safeNext(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/auth/reset-password";
  return value;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = safeNext(searchParams.get("next"));
  redirectUrl.search = "";

  if (tokenHash && (type === "recovery" || type === "email")) {
    const supabase = await createSupabaseServerClient();
    const { data: verified, error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (!error) {
      if (type === "email") {
        const user = verified.user;
        const admin = createSupabaseAdminClient();
        if (user && admin) {
          const { data: profile } = await admin.from("profiles").select("role").eq("user_id", user.id).maybeSingle();
          if (profile?.role === "user") {
            try {
              await queueUserEmail(admin, { userId: user.id, eventKey: `member-welcome:${user.id}`, eventType: "member_welcome", template: "memberWelcome" });
            } catch {
              console.error("[transactional-email] confirmed member welcome failed", { userId: user.id });
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
              console.error("[transactional-email] confirmed member admin notification failed", { userId: user.id });
            }
          } else {
            redirectUrl.pathname = "/authors-login";
          }
        }
      }
      return NextResponse.redirect(redirectUrl);
    }
  }

  redirectUrl.pathname = type === "email" ? "/login" : "/auth/reset-password";
  redirectUrl.searchParams.set("error", type === "email" ? "invalid_confirmation_link" : "invalid_recovery_link");
  return NextResponse.redirect(redirectUrl);
}
