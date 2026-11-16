import type { Metadata } from "next";
import { LiveAdminCollection } from "@/components/admin/LiveAdminCollection";
import { getAdminLessons, getAdminFilterOptions, type AdminFilters } from "@/lib/admin/content";

export const metadata: Metadata = {
  title: "Lessons",
  description: "Live lesson management data.",
};

export default async function AdminLessonsPage({ searchParams }: { searchParams: Promise<{ book?: string; guidance?: string }> }) {
  const params = await searchParams;
  const filters: AdminFilters = { book: params.book, guidance: params.guidance };
  const [items, filterOptions] = await Promise.all([getAdminLessons(filters), getAdminFilterOptions()]);
  return <LiveAdminCollection title="Lessons" description="Live lesson records from Supabase." items={items} filterOptions={filterOptions} filters={filters} basePath="/admin/lessons" />;
}
