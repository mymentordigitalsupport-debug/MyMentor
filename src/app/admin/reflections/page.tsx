import type { Metadata } from "next";
import { CenteredPagePlaceholder } from "@/components/ui/CenteredPagePlaceholder";

export const metadata: Metadata = {
  title: "Reflections",
  description: "Admin placeholder page for reflections.",
};

export default function AdminReflectionsPage() {
  return (
    <CenteredPagePlaceholder
      title="Reflections"
      description="This admin page is reserved for a future reflections overview."
    />
  );
}
