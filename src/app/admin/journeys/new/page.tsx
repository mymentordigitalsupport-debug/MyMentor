import type { Metadata } from "next";
import { JourneyWizard } from "./journey-wizard";

export const metadata: Metadata = {
  title: "New Journey",
  description: "Create a live journey record.",
};

export default function AdminNewJourneyRecordPage() {
  return <JourneyWizard />;
}
