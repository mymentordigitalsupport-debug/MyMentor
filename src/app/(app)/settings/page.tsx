import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SettingsPanel } from "@/components/settings/SettingsPanel";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { GuidancePath } from "@/types";

export const metadata: Metadata = {
  title: "Settings",
};

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, anonymous_name, is_anonymous, preferred_guidance_path")
    .eq("id", user.id)
    .maybeSingle();

  const guidancePath: GuidancePath =
    profile?.preferred_guidance_path === "christian" ? "christian" : "religious";

  return (
    <SettingsPanel
      userId={user.id}
      email={user.email ?? null}
      displayName={profile?.display_name ?? user.email?.split("@")[0] ?? "Friend"}
      anonymousName={profile?.anonymous_name ?? null}
      isAnonymous={profile?.is_anonymous ?? false}
      guidancePath={guidancePath}
    />
  );
}
