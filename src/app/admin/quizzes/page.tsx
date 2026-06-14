import type { Metadata } from "next";
import { CenteredPagePlaceholder } from "@/components/ui/CenteredPagePlaceholder";

export const metadata: Metadata = {
  title: "Quizzes",
  description: "Admin placeholder page for quizzes.",
};

export default function AdminQuizzesPage() {
  return (
    <CenteredPagePlaceholder
      title="Quizzes"
      description="This admin page is reserved for a future quizzes overview."
    />
  );
}
