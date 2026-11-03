import type { Metadata } from "next";
import { LiveAdminCollection } from "@/components/admin/LiveAdminCollection";
import { getAdminMedia } from "@/lib/admin/content";

export const metadata: Metadata = {
  title: "Media",
  description: "Live media library data.",
};

export default async function AdminMediaPage() {
  return <LiveAdminCollection title="Media" description="Live video and audio records from Supabase." items={await getAdminMedia()} />;
}
