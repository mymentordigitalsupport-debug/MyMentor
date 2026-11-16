import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function requireAdminSession() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, user: null, role: null };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role,status")
    .eq("user_id", user.id)
    .maybeSingle();

  const disabled = ["paused", "blocked", "suspended", "disabled", "anonymized"].includes(profile?.status ?? "");
  const role = disabled ? null : profile?.role ?? (user.app_metadata?.role as string | undefined) ?? null;

  return { supabase, user, role, status: profile?.status ?? "active" };
}

