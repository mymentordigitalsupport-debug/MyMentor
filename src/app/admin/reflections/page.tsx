import type { Metadata } from "next";
import { LiveAdminCollection } from "@/components/admin/LiveAdminCollection";
import { getAdminReflections } from "@/lib/admin/content";

export const metadata: Metadata = {
  title: "Reflections",
  description: "Live reflection content data.",
};

export default async function AdminReflectionsPage() {
  return <LiveAdminCollection title="Reflections" description="Live reflection prompts and pause cards from Supabase." items={await getAdminReflections()} />;
}
