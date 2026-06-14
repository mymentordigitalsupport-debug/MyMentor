import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/guards";
import { getAdminUsersDirectory } from "@/lib/admin/users";

export async function GET() {
  const { user, role } = await requireAdminSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const data = await getAdminUsersDirectory();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to load admin users directory:", error);
    return NextResponse.json({ error: "Failed to load users" }, { status: 500 });
  }
}

