import type { Metadata } from "next";
import { CenteredPagePlaceholder } from "@/components/ui/CenteredPagePlaceholder";

export const metadata: Metadata = {
  title: "Course",
  description: "Admin placeholder page for a course record.",
};

export default function AdminCoursePage() {
  return (
    <CenteredPagePlaceholder
      title="Course"
      description="This admin page is reserved for a future course detail view."
    />
  );
}
