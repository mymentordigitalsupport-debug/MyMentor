import type { Metadata } from "next";
import { OverviewHeader } from "@/components/admin/OverviewHeader";
import { OverviewInsightsSection } from "@/components/admin/OverviewInsightsSection";
import { OverviewStatsSection } from "@/components/admin/OverviewStatsSection";

export const metadata: Metadata = {
  title: "Overview",
  description: "Analytics summary of your platform.",
};

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <OverviewHeader />
      <OverviewStatsSection />
      <OverviewInsightsSection />
    </div>
  );
}
