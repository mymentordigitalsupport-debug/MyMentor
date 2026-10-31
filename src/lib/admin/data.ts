import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getAdminSupabaseClient() {
  return createSupabaseAdminClient() ?? (await createSupabaseServerClient());
}

