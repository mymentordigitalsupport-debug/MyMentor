import type { Metadata } from "next";
import { LiveAdminCollection } from "@/components/admin/LiveAdminCollection";
import { getAdminCourses } from "@/lib/admin/content";

export const metadata: Metadata = {
  title: "Journeys",
  description: "Live journey records.",
};

export default async function AdminJourneysListPage() {
  return <LiveAdminCollection title="Journeys" description="Live journey records from Supabase." items={await getAdminCourses()} createHref="/admin/journeys/new" createLabel="Create journey" />;
}
