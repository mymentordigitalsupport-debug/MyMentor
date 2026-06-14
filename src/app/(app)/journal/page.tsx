import type { Metadata } from "next";
import { CenteredPagePlaceholder } from "@/components/ui/CenteredPagePlaceholder";

export const metadata: Metadata = {
  title: "Journal",
};

export default function JournalPage() {
  return (
    <CenteredPagePlaceholder
      title="Journal"
      description="This section is reserved for future journal tools and reflections."
    />
  );
}
