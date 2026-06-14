import type { Metadata } from "next";
import { CenteredPagePlaceholder } from "@/components/ui/CenteredPagePlaceholder";

export const metadata: Metadata = {
  title: "Lessons",
  description: "Admin placeholder page for lessons.",
};

export default function AdminLessonsPage() {
  return (
    <CenteredPagePlaceholder
      title="Lessons"
      description="This admin page is reserved for a future lessons overview."
    />
  );
}
