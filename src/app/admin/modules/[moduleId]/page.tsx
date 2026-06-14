import type { Metadata } from "next";
import { CenteredPagePlaceholder } from "@/components/ui/CenteredPagePlaceholder";

export const metadata: Metadata = {
  title: "Chapter Detail",
  description: "Admin placeholder page for a chapter detail.",
};

export default function AdminChapterDetailPage() {
  return (
    <CenteredPagePlaceholder
      title="Chapter Detail"
      description="This admin page is reserved for a future chapter detail view."
    />
  );
}
