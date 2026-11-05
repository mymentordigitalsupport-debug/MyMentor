import type { Metadata } from "next";
import { LiveAdminCollection } from "@/components/admin/LiveAdminCollection";
import { getAdminQuizzes } from "@/lib/admin/content";

export const metadata: Metadata = {
  title: "Quizzes",
  description: "Live lesson quiz questions and member response data.",
};

export default async function AdminQuizzesPage() {
  return <LiveAdminCollection title="Quizzes" description="Live lesson questions, answer totals, and correctness rates." items={await getAdminQuizzes()} />;
}
