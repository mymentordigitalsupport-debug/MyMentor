import type { Metadata } from "next";
import { LiveAdminCollection } from "@/components/admin/LiveAdminCollection";
import { getAdminResources } from "@/lib/admin/content";

export const metadata: Metadata = {
  title: "Resources",
  description: "Live resource library data.",
};

export default async function AdminResourcesPage() {
  return <LiveAdminCollection title="Resources" description="Published resource records and files in the resources storage bucket." items={await getAdminResources()} />;
}
