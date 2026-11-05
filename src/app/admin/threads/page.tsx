import type { Metadata } from "next";
import { ThreadsModerationPanel } from "@/components/admin/ThreadsModerationPanel";

export const metadata: Metadata = { title: "Threads moderation" };

export default function AdminThreadsPage() {
  return <div className="space-y-6"><div><p className="text-sm font-medium text-forest">Community</p><h1 className="text-3xl font-bold tracking-tight text-text">Threads moderation</h1><p className="mt-2 text-muted">Monitor discussion, comments, reactions, topics, and comment bans.</p></div><ThreadsModerationPanel /></div>;
}
