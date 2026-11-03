import type { Metadata } from "next";
import { LiveAdminCollection } from "@/components/admin/LiveAdminCollection";
import { getAdminChapters } from "@/lib/admin/content";

export const metadata: Metadata = {
  title: "Chapters",
  description: "Live chapter management data.",
};

export default async function AdminChaptersPage() {
  return <LiveAdminCollection title="Chapters" description="Live chapter records from Supabase." items={await getAdminChapters()} />;
}
