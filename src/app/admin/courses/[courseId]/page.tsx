import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LiveAdminDetail } from "@/components/admin/LiveAdminDetail";
import { getAdminCourses } from "@/lib/admin/content";

export const metadata: Metadata = {
  title: "Course",
  description: "Live course record.",
};

export default async function AdminCoursePage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const course = (await getAdminCourses()).find((item) => item.id === courseId);
  if (!course) notFound();
  return <LiveAdminDetail item={course} backHref="/admin/courses" backLabel="Back to courses" />;
}
