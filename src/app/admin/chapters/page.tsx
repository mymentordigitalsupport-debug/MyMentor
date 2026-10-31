import type { Metadata } from "next";
import { CenteredPagePlaceholder } from "@/components/ui/CenteredPagePlaceholder";

export const metadata: Metadata = {
  title: "Chapters",
  description: "Admin placeholder page for chapters.",
};

export default function AdminChaptersPage() {
  return (
    <CenteredPagePlaceholder
      title="Chapters"
      description="This admin page is reserved for a future chapters overview."
    />
  );
}
