import type { Metadata } from "next";
import { CenteredPagePlaceholder } from "@/components/ui/CenteredPagePlaceholder";

export const metadata: Metadata = {
  title: "New Journey",
  description: "Admin placeholder page for a new journey record.",
};

export default function AdminNewJourneyRecordPage() {
  return (
    <CenteredPagePlaceholder
      title="New Journey"
      description="This admin page is reserved for creating a journey."
    />
  );
}
