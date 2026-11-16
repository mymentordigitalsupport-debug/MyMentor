import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ error: "Admin login now uses Supabase Auth." }, { status: 410 });
}
