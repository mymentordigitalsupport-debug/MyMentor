import type { Metadata } from "next";
import { ReflectionsAdminPanel } from "@/components/admin/ReflectionsAdminPanel";
import { getAdminFilterOptions, getAdminReflectionRecords, type AdminFilters } from "@/lib/admin/content";
import { ContentFilters } from "@/components/admin/ContentFilters";

export const metadata: Metadata = {
  title: "Reflections",
  description: "Live reflection prompts and member responses.",
};

export default async function AdminReflectionsPage({ searchParams }: { searchParams: Promise<{ book?: string; guidance?: string }> }) {
  const params = await searchParams;
  const filters: AdminFilters = { book: params.book, guidance: params.guidance };
  const [records, filterOptions] = await Promise.all([getAdminReflectionRecords(filters), getAdminFilterOptions()]);
  return <div className="space-y-6"><ContentFilters options={filterOptions} filters={filters} basePath="/admin/reflections" /><ReflectionsAdminPanel records={records} /></div>;
}
