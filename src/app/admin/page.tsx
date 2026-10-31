import type { Metadata } from "next";
import { OverviewHeader } from "@/components/admin/OverviewHeader";
import { OverviewInsightsSection } from "@/components/admin/OverviewInsightsSection";
import { OverviewStatsSection } from "@/components/admin/OverviewStatsSection";
import { getAdminOverview } from "@/lib/admin/overview";

export const metadata: Metadata = {
  title: "Overview",
  description: "Analytics summary of your platform.",
};

export default async function AdminDashboardPage() {
  const overview = await getAdminOverview();
  return (
    <div className="space-y-6">
      <OverviewHeader />
      <OverviewStatsSection stats={overview.stats} />
      <OverviewInsightsSection courses={overview.courses} moods={overview.moods} moodTotal={overview.moodTotal} />
    </div>
  );
}
