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
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  const role = (user.app_metadata?.role as string | undefined) ?? profile?.role ?? null;

  return { supabase, user, role };
}

