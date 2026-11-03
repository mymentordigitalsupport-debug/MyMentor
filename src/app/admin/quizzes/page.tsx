import type { Metadata } from "next";
import { LiveAdminCollection } from "@/components/admin/LiveAdminCollection";
import { getAdminQuizzes } from "@/lib/admin/content";

export const metadata: Metadata = {
  title: "Quizzes",
  description: "Live quiz data.",
};

export default async function AdminQuizzesPage() {
  return <LiveAdminCollection title="Quizzes" description="Live quizzes and question counts from Supabase." items={await getAdminQuizzes()} />;
}
