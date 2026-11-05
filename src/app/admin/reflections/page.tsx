import type { Metadata } from "next";
import { ReflectionsAdminPanel } from "@/components/admin/ReflectionsAdminPanel";
import { getAdminReflectionRecords } from "@/lib/admin/content";

export const metadata: Metadata = {
  title: "Reflections",
  description: "Live reflection prompts and member responses.",
};

export default async function AdminReflectionsPage() {
  return <ReflectionsAdminPanel records={await getAdminReflectionRecords()} />;
}
