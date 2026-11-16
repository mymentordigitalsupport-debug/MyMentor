import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasTrustedOrigin } from "@/lib/security";

const GUIDANCE_PATHS = new Set(["christian", "religious"]);

export async function POST(request: Request) {
  if (!hasTrustedOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const body = await request.json().catch(() => null) as { guidancePath?: unknown } | null;
  const guidancePath = typeof body?.guidancePath === "string" ? body.guidancePath : "";
  if (!GUIDANCE_PATHS.has(guidancePath)) {
    return NextResponse.json({ error: "Choose a valid guidance path." }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "Account service is unavailable." }, { status: 503 });

  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("selected_course_id,active_course_version_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (profileError || !profile?.selected_course_id) {
    return NextResponse.json({ error: "Your course could not be found." }, { status: 404 });
  }

  const { data: targetVersion, error: versionError } = await admin
    .from("course_versions")
    .select("id")
    .eq("course_id", profile.selected_course_id)
    .eq("guidance_path", guidancePath)
    .maybeSingle();
  if (versionError || !targetVersion) {
    return NextResponse.json({ error: "That guidance version is not available for this course." }, { status: 409 });
  }

  const { data: entitlement, error: entitlementError } = await admin
    .from("course_entitlements")
    .select("id")
    .eq("user_id", user.id)
    .eq("course_version_id", targetVersion.id)
    .eq("active", true)
    .limit(1)
    .maybeSingle();
  if (entitlementError || !entitlement) {
    return NextResponse.json({ error: "Your purchase does not include this guidance version yet." }, { status: 403 });
  }

  const { error: updateError } = await admin
    .from("profiles")
    .update({
      preferred_guidance_path: guidancePath,
      active_course_version_id: targetVersion.id,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id);
  if (updateError) return NextResponse.json({ error: "Unable to switch guidance." }, { status: 500 });

  return NextResponse.json({ activeCourseVersionId: targetVersion.id, guidancePath });
}
