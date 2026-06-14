import type { Metadata } from "next";
import { CenteredPagePlaceholder } from "@/components/ui/CenteredPagePlaceholder";

export const metadata: Metadata = {
  title: "Settings",
};

export default function SettingsPage() {
  return (
    <CenteredPagePlaceholder
      title="Settings"
      description="This page will later hold profile preferences and account controls."
    />
  );
}
