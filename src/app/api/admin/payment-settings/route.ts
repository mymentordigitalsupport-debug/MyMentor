import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireAdminSession } from "@/lib/admin/guards";
import { hasTrustedOrigin } from "@/lib/security";

export async function GET() {
  const { user, role } = await requireAdminSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  const { data, error } = await admin.from("payment_settings").select("bank_name,account_holder,account_number,branch_code,instructions,is_active").eq("id", true).maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ settings: data });
}

export async function POST(request: Request) {
  if (!hasTrustedOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  const { user, role } = await requireAdminSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const text = (key: string, max: number) => typeof body?.[key] === "string" ? body[key].trim().slice(0, max) : "";
  const bank_name = text("bank_name", 120); const account_holder = text("account_holder", 160); const account_number = text("account_number", 80); const branch_code = text("branch_code", 40); const instructions = text("instructions", 1000);
  if (!bank_name || !account_holder || !account_number) return NextResponse.json({ error: "Bank, account holder, and account number are required." }, { status: 400 });
  const { error } = await admin.from("payment_settings").upsert({ id: true, bank_name, account_holder, account_number, branch_code: branch_code || null, instructions: instructions || null, is_active: true, updated_by: user.id, updated_at: new Date().toISOString() });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
