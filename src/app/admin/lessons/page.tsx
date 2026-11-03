import type { Metadata } from "next";
import { LiveAdminCollection } from "@/components/admin/LiveAdminCollection";
import { getAdminLessons } from "@/lib/admin/content";

export const metadata: Metadata = {
  title: "Lessons",
  description: "Live lesson management data.",
};

export default async function AdminLessonsPage() {
  return <LiveAdminCollection title="Lessons" description="Live lesson records from Supabase." items={await getAdminLessons()} />;
}
