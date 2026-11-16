import type { Metadata } from "next";
import { LessonBuilderClient, type BlockRow, type LessonRow } from "./lesson-builder-client";
import { getAdminLessonBuilderData } from "@/lib/admin/content";
import { getAdminFilterOptions, type AdminFilters } from "@/lib/admin/content";
import { ContentFilters } from "@/components/admin/ContentFilters";

export const metadata: Metadata = {
  title: "Lesson Builder",
  description: "Live lesson content builder.",
};

export default async function AdminLessonBuilderPage({
  searchParams,
}: {
  searchParams: Promise<{ lesson?: string; section?: string; preview?: string; book?: string; guidance?: string }>;
}) {
  const params = await searchParams;
  const filters: AdminFilters = { book: params.book, guidance: params.guidance };
  const [{ lessons, blocks }, filterOptions] = await Promise.all([
    getAdminLessonBuilderData(filters),
    getAdminFilterOptions(),
  ]);
  return <div className="space-y-6"><ContentFilters options={filterOptions} filters={filters} basePath="/admin/lesson-builder" /><LessonBuilderClient lessons={lessons as LessonRow[]} blocks={blocks as BlockRow[]} initialLessonId={params.lesson} initialSectionKey={params.section} initialPreview={params.preview === "1"} /></div>;
}
