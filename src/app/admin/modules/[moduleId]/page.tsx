import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LiveAdminDetail } from "@/components/admin/LiveAdminDetail";
import { getAdminChapters } from "@/lib/admin/content";

export const metadata: Metadata = {
  title: "Chapter Detail",
  description: "Live legacy module record.",
};

export default async function AdminChapterDetailPage({ params }: { params: Promise<{ moduleId: string }> }) {
  const { moduleId } = await params;
  const chapter = (await getAdminChapters()).find((item) => item.id === moduleId);
  if (!chapter) notFound();
  return <LiveAdminDetail item={chapter} backHref="/admin/modules" backLabel="Back to chapters" />;
}
