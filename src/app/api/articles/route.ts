import { NextResponse } from "next/server";
import { getPublishedArticles } from "@/lib/articles";

export async function GET(request: Request) {
  const rawLimit = Number(new URL(request.url).searchParams.get("limit"));
  const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(Math.floor(rawLimit), 12) : undefined;
  try {
    return NextResponse.json({ articles: await getPublishedArticles(limit) });
  } catch {
    return NextResponse.json({ articles: [] });
  }
}
