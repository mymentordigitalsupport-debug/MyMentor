import type { Metadata } from "next";
import { LessonBuilderClient, type BlockRow, type LessonRow } from "./lesson-builder-client";
import { getAdminLessonBuilderData } from "@/lib/admin/content";

export const metadata: Metadata = {
  title: "Lesson Builder",
  description: "Live lesson content builder.",
};

export default async function AdminLessonBuilderPage({
  searchParams,
}: {
  searchParams: Promise<{ lesson?: string; section?: string; preview?: string }>;
}) {
  const [{ lessons, blocks }, { lesson, section, preview }] = await Promise.all([
    getAdminLessonBuilderData(),
    searchParams,
  ]);
  return <LessonBuilderClient lessons={lessons as LessonRow[]} blocks={blocks as BlockRow[]} initialLessonId={lesson} initialSectionKey={section} initialPreview={preview === "1"} />;
}
