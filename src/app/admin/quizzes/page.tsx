import type { Metadata } from "next";
import { LiveAdminCollection } from "@/components/admin/LiveAdminCollection";
import { getAdminFilterOptions, getAdminQuizzes, type AdminFilters } from "@/lib/admin/content";
import { ContentFilters } from "@/components/admin/ContentFilters";

export const metadata: Metadata = {
  title: "Quizzes",
  description: "Live lesson quiz questions and member response data.",
};

export default async function AdminQuizzesPage({ searchParams }: { searchParams: Promise<{ book?: string; guidance?: string }> }) {
  const params = await searchParams;
  const filters: AdminFilters = { book: params.book, guidance: params.guidance };
  const [items, filterOptions] = await Promise.all([getAdminQuizzes(filters), getAdminFilterOptions()]);
  return <div className="space-y-6"><ContentFilters options={filterOptions} filters={filters} basePath="/admin/quizzes" /><LiveAdminCollection title="Quizzes" description="Live lesson questions, answer totals, and correctness rates." items={items} /></div>;
}
