import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireAdminSession } from "@/lib/admin/guards";
import { getAdminUserDetail } from "@/lib/admin/users";

type PatchPayload =
  | {
    action: "update";
      display_name?: string | null;
      anonymous_name?: string | null;
      goal?: string | null;
      guidance_path?: "christian" | "religious";
      onboarding_done?: boolean;
    }
  | {
      action: "suspend" | "reactivate";
    }
  | {
      action: "anonymize";
    };

async function assertAdmin() {
  const { user, role } = await requireAdminSession();
  if (!user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  if (role !== "admin") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  const admin = createSupabaseAdminClient();
  if (!admin) {
    return { error: NextResponse.json({ error: "Server configuration error" }, { status: 500 }) };
  }

  return { admin };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const auth = await assertAdmin();
  if ("error" in auth) {
    return auth.error;
  }

  const { userId } = await params;

  try {
    const user = await getAdminUserDetail(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ user });
  } catch (error) {
    console.error("Failed to load user detail:", error);
    return NextResponse.json({ error: "Failed to load user" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const auth = await assertAdmin();
  if ("error" in auth) {
    return auth.error;
  }

  const { admin } = auth;
  const { userId } = await params;
  const payload = (await request.json()) as PatchPayload;

  try {
    if (payload.action === "update") {
      const updates: Record<string, unknown> = {
        display_name: payload.display_name?.trim() || null,
        anonymous_name: payload.anonymous_name?.trim() || null,
        personal_goal: payload.goal?.trim() || null,
        preferred_guidance_path: payload.guidance_path ?? undefined,
        onboarding_completed: Boolean(payload.onboarding_done),
        updated_at: new Date().toISOString(),
      };

      const { error } = await admin
        .from("profiles")
        .update(updates)
        .eq("user_id", userId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    if (payload.action === "suspend" || payload.action === "reactivate") {
      const nextStatus = payload.action === "suspend" ? "paused" : "active";
      const { error } = await admin
        .from("profiles")
        .update({
          status: nextStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, account_status: nextStatus });
    }

    if (payload.action === "anonymize") {
      const { data: existing, error: lookupError } = await admin
        .from("profiles")
        .select("anonymous_name")
        .eq("user_id", userId)
        .maybeSingle();

      if (lookupError) {
        return NextResponse.json({ error: lookupError.message }, { status: 500 });
      }

      const { error } = await admin
        .from("profiles")
        .update({
          display_name: null,
          personal_goal: null,
          is_anonymous: true,
          anonymous_name: existing?.anonymous_name ?? `Anonymous ${Math.floor(Math.random() * 9999)}`,
          status: "blocked",
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, account_status: "anonymized" });
    }

    return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
  } catch (error) {
    console.error("Failed to update user:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const auth = await assertAdmin();
  if ("error" in auth) {
    return auth.error;
  }

  const { admin } = auth;
  const { userId } = await params;
  const body = (await request.json().catch(() => ({}))) as { confirm?: boolean };

  if (!body.confirm) {
    return NextResponse.json({ error: "Confirmation required" }, { status: 400 });
  }

  const tables = [
    ["journal_entries", "user_id"],
    ["mood_checkins", "user_id"],
    ["saved_insights", "user_id"],
    ["user_course_progress", "user_id"],
    ["user_lesson_progress", "user_id"],
    ["profiles", "user_id"],
  ] as const;

  for (const [table, column] of tables) {
    const { error } = await admin.from(table).delete().eq(column, userId);
    if (error) {
      return NextResponse.json({ error: `Failed to delete ${table}` }, { status: 500 });
    }
  }

  const { error: authError } = await admin.auth.admin.deleteUser(userId);
  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
