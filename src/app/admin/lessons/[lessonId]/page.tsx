import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LiveAdminDetail } from "@/components/admin/LiveAdminDetail";
import { getAdminLessons } from "@/lib/admin/content";

export const metadata: Metadata = {
  title: "Lesson Detail",
  description: "Live lesson record.",
};

export default async function AdminLessonDetailPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params;
  const lesson = (await getAdminLessons()).find((item) => item.id === lessonId);
  if (!lesson) notFound();
  return <LiveAdminDetail item={lesson} backHref="/admin/lessons" backLabel="Back to lessons" />;
}
