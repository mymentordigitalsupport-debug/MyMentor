import type { Metadata } from "next";
import { CenteredPagePlaceholder } from "@/components/ui/CenteredPagePlaceholder";

export const metadata: Metadata = {
  title: "New Course",
  description: "Admin placeholder page for creating a new course.",
};

export default function AdminNewCoursePage() {
  return (
    <CenteredPagePlaceholder
      title="New Course"
      description="This admin screen is reserved for a future course creation flow."
    />
  );
}
