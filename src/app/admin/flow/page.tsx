import type { Metadata } from "next";
import { CenteredPagePlaceholder } from "@/components/ui/CenteredPagePlaceholder";

export const metadata: Metadata = {
  title: "Flow",
  description: "Admin placeholder page for the content flow map.",
};

export default function AdminFlowPage() {
  return (
    <CenteredPagePlaceholder
      title="Flow"
      description="This admin page is reserved for a future content flow view."
    />
  );
}
