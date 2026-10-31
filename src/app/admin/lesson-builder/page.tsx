import type { Metadata } from "next";
import { CenteredPagePlaceholder } from "@/components/ui/CenteredPagePlaceholder";

export const metadata: Metadata = {
  title: "Lesson Builder",
  description: "Admin placeholder page for the lesson builder.",
};

export default function AdminLessonBuilderPage() {
  return (
    <CenteredPagePlaceholder
      title="Lesson Builder"
      description="This admin page is reserved for a future lesson-building workspace."
    />
  );
}
