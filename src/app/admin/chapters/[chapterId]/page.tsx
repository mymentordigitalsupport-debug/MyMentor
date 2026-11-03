import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LiveAdminDetail } from "@/components/admin/LiveAdminDetail";
import { getAdminChapters } from "@/lib/admin/content";

export const metadata: Metadata = {
  title: "Chapter Detail",
  description: "Live chapter record.",
};

export default async function AdminChapterDetailPage({ params }: { params: Promise<{ chapterId: string }> }) {
  const { chapterId } = await params;
  const chapter = (await getAdminChapters()).find((item) => item.id === chapterId);
  if (!chapter) notFound();
  return <LiveAdminDetail item={chapter} backHref="/admin/chapters" backLabel="Back to chapters" />;
}
