import type { Metadata } from "next";
import { LiveAdminCollection } from "@/components/admin/LiveAdminCollection";
import { getAdminChapters, getAdminFilterOptions, type AdminFilters } from "@/lib/admin/content";

export const metadata: Metadata = {
  title: "Chapters",
  description: "Live chapter management data.",
};

export default async function AdminChaptersPage({ searchParams }: { searchParams: Promise<{ book?: string; guidance?: string }> }) {
  const params = await searchParams;
  const filters: AdminFilters = { book: params.book, guidance: params.guidance };
  const [items, filterOptions] = await Promise.all([getAdminChapters(filters), getAdminFilterOptions()]);
  return <LiveAdminCollection title="Chapters" description="Live chapter records from Supabase." items={items} filterOptions={filterOptions} filters={filters} basePath="/admin/chapters" />;
}
