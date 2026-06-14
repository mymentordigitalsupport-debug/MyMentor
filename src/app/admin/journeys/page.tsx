import type { Metadata } from "next";
import { CenteredPagePlaceholder } from "@/components/ui/CenteredPagePlaceholder";

export const metadata: Metadata = {
  title: "Journeys",
  description: "Admin placeholder page for journey management.",
};

export default function AdminJourneysListPage() {
  return (
    <CenteredPagePlaceholder
      title="Journeys"
      description="This admin page is reserved for a future journeys list."
    />
  );
}
