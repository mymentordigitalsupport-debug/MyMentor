import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const authorization = request.headers.get("authorization");
  const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;
  if (!token) return NextResponse.json({ error: "Authentication is required." }, { status: 401 });

  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "Authentication service is unavailable." }, { status: 503 });

  const { data: authData, error: authError } = await admin.auth.getUser(token);
  if (authError || !authData.user) return NextResponse.json({ error: "Your session is no longer valid." }, { status: 401 });

  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("role, status, onboarding_completed")
    .eq("user_id", authData.user.id)
    .maybeSingle();
  if (profileError) return NextResponse.json({ error: "Unable to read account access." }, { status: 500 });

  const { data: entitlement, error: entitlementError } = await admin
    .from("course_entitlements")
    .select("id")
    .eq("user_id", authData.user.id)
    .eq("active", true)
    .limit(1)
    .maybeSingle();
  if (entitlementError) return NextResponse.json({ error: "Unable to read payment access." }, { status: 500 });

  const disabled = ["paused", "blocked", "suspended", "disabled", "anonymized"].includes(profile?.status ?? "");
  if (disabled) return NextResponse.json({ error: "This account is disabled." }, { status: 403 });

  return NextResponse.json({
    role: profile?.role ?? "user",
    onboardingCompleted: profile?.onboarding_completed ?? false,
    hasPaidAccess: Boolean(entitlement),
  });
}
