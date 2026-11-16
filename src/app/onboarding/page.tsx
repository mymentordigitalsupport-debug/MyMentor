import { OnboardingShell, type OnboardingJourney, type OnboardingProfile } from "@/components/onboarding/OnboardingShell";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import type { GuidancePath, MoodValue } from "@/types";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Getting Started",
  robots: { index: false, follow: false },
};

export default async function OnboardingPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const admin = createSupabaseAdminClient();
  if (!admin) redirect("/payments");

  const { data: entitlements, error: entitlementError } = await admin
    .from("course_entitlements")
    .select("course_version_id,access_level")
    .eq("user_id", user.id)
    .eq("active", true)
    .limit(10);

  if (entitlementError) throw entitlementError;
  const entitlement = entitlements?.find((item) => item.access_level === "full_course") ?? entitlements?.[0];
  if (!entitlement) {
    redirect("/payments");
  }

  const [{ data: profile, error: profileError }, { data: version, error: versionError }] = await Promise.all([
    supabase
    .from("profiles")
    .select("display_name,username,anonymous_name,is_anonymous,personal_goal,mood_baseline,onboarding_completed")
    .eq("user_id", user.id)
    .maybeSingle(),
    admin.from("course_versions").select("id,course_id,title,guidance_path").eq("id", entitlement.course_version_id).single(),
  ]);

  if (profileError || !profile) throw profileError ?? new Error("Member profile not found.");
  if (versionError || !version) throw versionError ?? new Error("Approved course version not found.");

  if (profile.onboarding_completed) {
    redirect("/today");
  }

  const { data: course, error: courseError } = await admin.from("courses").select("title").eq("id", version.course_id).single();
  if (courseError || !course) throw courseError ?? new Error("Approved course not found.");

  const journey: OnboardingJourney = {
    courseId: version.course_id,
    versionId: version.id,
    title: course.title,
    guidancePath: version.guidance_path as GuidancePath,
    accessLevel: entitlement.access_level as OnboardingJourney["accessLevel"],
  };
  const initialProfile: OnboardingProfile = {
    displayName: profile.username || profile.display_name || user.email?.split("@")[0] || "",
    anonymousName: profile.anonymous_name,
    isAnonymous: Boolean(profile.is_anonymous),
    goal: profile.personal_goal ?? "",
    mood: (profile.mood_baseline as MoodValue | null) ?? null,
  };

  return <OnboardingShell journey={journey} profile={initialProfile} />;
}
