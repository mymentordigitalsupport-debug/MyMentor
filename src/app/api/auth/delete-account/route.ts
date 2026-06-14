import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey || serviceRoleKey === "your-service-role-key-here") {
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  const tables = [
    ["journal_entries", "user_id"],
    ["mood_checkins", "user_id"],
    ["saved_insights", "user_id"],
    ["user_course_progress", "user_id"],
    ["user_lesson_progress", "user_id"],
    ["profiles", "id"],
  ] as const;

  for (const [table, column] of tables) {
    const { error } = await admin.from(table).delete().eq(column, user.id);
    if (error) {
      return NextResponse.json({ error: `Failed to delete ${table}` }, { status: 500 });
    }
  }

  const { error: authError } = await admin.auth.admin.deleteUser(user.id);
  if (authError) {
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
  }

  await supabase.auth.signOut();

  return NextResponse.json({ success: true });
}
