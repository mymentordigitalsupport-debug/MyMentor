import type { Metadata } from "next";
import { CenteredPagePlaceholder } from "@/components/ui/CenteredPagePlaceholder";

export const metadata: Metadata = {
  title: "Resources",
  description: "Admin placeholder page for resources.",
};

export default function AdminResourcesPage() {
  return (
    <CenteredPagePlaceholder
      title="Resources"
      description="This admin page is reserved for a future resources overview."
    />
  );
}
