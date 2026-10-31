import type { Metadata } from "next";
import { CenteredPagePlaceholder } from "@/components/ui/CenteredPagePlaceholder";

export const metadata: Metadata = {
  title: "Journey Detail",
  description: "Admin placeholder page for a journey detail record.",
};

export default function AdminJourneyDetailPage() {
  return (
    <CenteredPagePlaceholder
      title="Journey Detail"
      description="This admin page is reserved for a future journey detail view."
    />
  );
}
