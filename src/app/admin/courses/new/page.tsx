import type { Metadata } from "next";
import { CourseWizard } from "./course-wizard";

export const metadata: Metadata = {
  title: "New Course",
  description: "Create a live course record.",
};

export default function AdminNewCoursePage() {
  return <CourseWizard />;
}
