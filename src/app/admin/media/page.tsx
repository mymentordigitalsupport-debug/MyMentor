import type { Metadata } from "next";
import { AdminMediaManager } from "@/components/admin/AdminMediaManager";
import { getAdminMedia } from "@/lib/admin/content";

export const metadata: Metadata = {
  title: "Media",
  description: "Live media library data.",
};

export default async function AdminMediaPage() {
  return <div className="space-y-6"><div><h1 className="text-2xl font-semibold text-text">Media</h1><p className="mt-1 text-sm text-muted">Upload and manage lesson audio.</p></div><AdminMediaManager items={await getAdminMedia()} /></div>;
}
