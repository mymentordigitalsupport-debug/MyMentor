import type { Metadata } from "next";
import { CenteredPagePlaceholder } from "@/components/ui/CenteredPagePlaceholder";

export const metadata: Metadata = {
  title: "Courses",
  description: "Admin placeholder page for courses.",
};

export default function AdminCoursesPage() {
  return (
    <CenteredPagePlaceholder
      title="Courses"
      description="This admin section is reserved for future course management tools."
    />
  );
}
