import type { Metadata } from "next";
import { CenteredPagePlaceholder } from "@/components/ui/CenteredPagePlaceholder";

export const metadata: Metadata = {
  title: "Progress",
};

export default function ProgressPage() {
  return (
    <CenteredPagePlaceholder
      title="Progress"
      description="This page will later hold a summary of lessons, milestones, and momentum."
    />
  );
}
