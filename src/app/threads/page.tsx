import { ThreadsPage } from "@/components/threads/ThreadsPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Threads",
  description: "Share your journey and support the MyMentor community.",
  alternates: { canonical: "/threads" },
};

export default function Page() {
  return <ThreadsPage />;
}
