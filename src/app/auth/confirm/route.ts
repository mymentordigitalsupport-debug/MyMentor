import type { EmailOtpType } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

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

  if (tokenHash && type === "recovery") {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (!error) return NextResponse.redirect(redirectUrl);
  }

  redirectUrl.searchParams.set("error", "invalid_recovery_link");
  return NextResponse.redirect(redirectUrl);
}
