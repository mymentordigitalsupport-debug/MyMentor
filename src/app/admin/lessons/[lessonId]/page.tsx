import type { Metadata } from "next";
import { CenteredPagePlaceholder } from "@/components/ui/CenteredPagePlaceholder";

export const metadata: Metadata = {
  title: "Lesson Detail",
  description: "Admin placeholder page for a lesson detail.",
};

export default function AdminLessonDetailPage() {
  return (
    <CenteredPagePlaceholder
      title="Lesson Detail"
      description="This admin page is reserved for a future lesson detail view."
    />
  );
}
