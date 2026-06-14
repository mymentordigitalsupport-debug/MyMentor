import type { Metadata } from "next";
import { CenteredPagePlaceholder } from "@/components/ui/CenteredPagePlaceholder";

export const metadata: Metadata = {
  title: "Resources",
};

export default function ResourcesPage() {
  return (
    <CenteredPagePlaceholder
      title="Resources"
      description="This area is reserved for future reading, audio, and support resources."
    />
  );
}
