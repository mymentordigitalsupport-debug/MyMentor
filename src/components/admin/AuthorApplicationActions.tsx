"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function AuthorApplicationActions({ applicationId }: { applicationId: string }) {
  const router = useRouter();
  const [working, setWorking] = useState<"approved" | "rejected" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function decide(status: "approved" | "rejected") {
    const feedback = status === "rejected"
      ? window.prompt("Explain why this application was not approved.")?.trim()
      : window.prompt("Optional note for this author:")?.trim();
    if (status === "rejected" && !feedback) return;

    setWorking(status);
    setError(null);
    try {
      const response = await fetch("/api/admin/articles", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "application", id: applicationId, status, feedback: feedback ?? "" }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error ?? "Unable to update the application.");
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to update the application.");
    } finally {
      setWorking(null);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button size="sm" loading={working === "approved"} disabled={working !== null} onClick={() => decide("approved")}>Approve author</Button>
      <Button size="sm" variant="danger" loading={working === "rejected"} disabled={working !== null} onClick={() => decide("rejected")}>Reject</Button>
      {error ? <p className="w-full text-xs text-red-700">{error}</p> : null}
    </div>
  );
}
