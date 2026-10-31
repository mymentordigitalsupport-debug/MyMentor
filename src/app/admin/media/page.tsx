import type { Metadata } from "next";
import { CenteredPagePlaceholder } from "@/components/ui/CenteredPagePlaceholder";

export const metadata: Metadata = {
  title: "Media",
  description: "Admin placeholder page for media management.",
};

export default function AdminMediaPage() {
  return (
    <CenteredPagePlaceholder
      title="Media"
      description="This admin page is reserved for a future media library."
    />
  );
}
