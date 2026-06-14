import { createSupabaseServerClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { ADMIN_OVERRIDE_COOKIE } from "@/lib/admin/auth";

export async function requireAdminSession() {
  const cookieStore = await cookies();
  if (cookieStore.get(ADMIN_OVERRIDE_COOKIE)?.value === "1") {
    return { supabase: null, user: null, role: "admin" as const };
  }

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

