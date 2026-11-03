import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LiveAdminDetail } from "@/components/admin/LiveAdminDetail";
import { getAdminCourses } from "@/lib/admin/content";

export const metadata: Metadata = {
  title: "Journey Detail",
  description: "Live journey record.",
};

export default async function AdminJourneyDetailPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const journey = (await getAdminCourses()).find((item) => item.id === courseId);
  if (!journey) notFound();
  return <LiveAdminDetail item={journey} backHref="/admin/journeys" backLabel="Back to journeys" />;
}
