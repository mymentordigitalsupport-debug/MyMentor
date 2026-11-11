import type { Metadata } from "next";
import { AdminResourceManager } from "@/components/admin/AdminResourceManager";
import { getAdminResources } from "@/lib/admin/content";

export const metadata: Metadata = {
  title: "Resources",
  description: "Live resource library data.",
};

export default async function AdminResourcesPage() {
  return <div className="space-y-6"><div><h1 className="text-2xl font-semibold text-text">Resources</h1><p className="mt-1 text-sm text-muted">Edit the member-facing title and description for each stored file.</p></div><AdminResourceManager items={await getAdminResources()} /></div>;
}
