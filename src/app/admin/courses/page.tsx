import type { Metadata } from "next";
import { LiveAdminCollection } from "@/components/admin/LiveAdminCollection";
import { getAdminCourses } from "@/lib/admin/content";

export const metadata: Metadata = {
  title: "Courses",
  description: "Live course management data.",
};

export default async function AdminCoursesPage() {
  return <LiveAdminCollection title="Courses" description="Live course records from Supabase." items={await getAdminCourses()} createHref="/admin/courses/new" createLabel="Create course" />;
}
