"use client";

import { useId, useMemo, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/ToastProvider";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { type GuidancePath, ANONYMOUS_NAMES } from "@/types";
import { randomAnonymousName } from "@/lib/utils";
import { CommunityTexture, PaperPin, PaperSurface } from "@/components/threads/ThreadPaper";
import styles from "@/components/threads/ThreadsCommunity.module.css";

interface SettingsPanelProps {
  userId: string;
  email: string | null;
  displayName: string;
  anonymousName: string | null;
  isAnonymous: boolean;
  guidancePath: GuidancePath;
}

export function SettingsPanel({
  userId,
  email,
  displayName,
  anonymousName,
  isAnonymous,
  guidancePath,
}: SettingsPanelProps) {
  const router = useRouter();
  const toast = useToast();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [name, setName] = useState(displayName);
  const [privacyMode, setPrivacyMode] = useState(isAnonymous);
  const [path, setPath] = useState<GuidancePath>(guidancePath);
  const [saving, setSaving] = useState(false);
  const anonymousPreview = anonymousName ?? ANONYMOUS_NAMES[0];
  const textureId = `settings-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;

  async function handleSaveProfile() {
    setSaving(true);

    try {
      const fallbackName = name.trim() || "Friend";
      const nextAnonymousName = privacyMode
        ? anonymousName ?? randomAnonymousName(ANONYMOUS_NAMES)
        : null;
      const nextDisplayName = privacyMode
        ? nextAnonymousName ?? fallbackName
        : fallbackName;

      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: nextDisplayName,
          anonymous_name: nextAnonymousName,
          is_anonymous: privacyMode,
          display_name_mode: privacyMode ? "nickname" : "real_name",
        })
        .eq("user_id", userId);

      if (error) throw error;

      if (path !== guidancePath) {
        const response = await fetch("/api/account/guidance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ guidancePath: path }),
        });
        if (!response.ok) {
          const payload = await response.json().catch(() => null) as { error?: string } | null;
          throw new Error(payload?.error ?? "Unable to switch guidance.");
        }
      }

      setName(nextDisplayName);
      toast.success(
        "Settings saved",
        path === guidancePath
          ? "Your profile preferences were updated."
          : "Your course has switched to the selected guidance version."
      );
      router.refresh();
    } catch (error) {
      setPath(guidancePath);
      toast.error(
        "Save failed",
        error instanceof Error ? error.message : "Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error("Logout failed");
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Logout failed", "Please try again.");
    }
  }

  async function handleDeleteAccount() {
    const confirmed = window.confirm(
      "Delete your account? This will remove your access and personal data."
    );

    if (!confirmed) return;

    try {
      const response = await fetch("/api/auth/delete-account", {
        method: "POST",
        headers: { "x-mym-acknowledge": "DELETE_MY_ACCOUNT" },
      });
      if (!response.ok) throw new Error("Delete failed");
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Delete failed", "Please try again.");
    }
  }

  return (
    <div className={styles.community} style={{ "--community-grain": `url(#${textureId}-grain)`, "--community-fibres": `url(#${textureId}-fibres)` } as CSSProperties}>
      <CommunityTexture id={textureId} />
      <div className={styles.boardLayout}>
      <section className={`${styles.mainColumn} ${styles.conversation}`} style={{ order: 2 }}>
        <PaperSurface seed={71} />
        <PaperPin className={styles.conversationPinRight} />
        <div className={styles.conversationContent}>
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">Profile</p>
        <h1 className="mt-1 text-2xl font-semibold text-forest">Settings</h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          Keep your account, guidance style, and privacy preferences aligned with how you want to use My Mentor.
        </p>

        <div className="mt-5 space-y-4">
          <Input
            label="Display name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="How should we address you?"
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setPrivacyMode(false)}
              className={[
                "rounded-2xl border px-4 py-4 text-left transition",
                !privacyMode
                  ? "border-[#7a9272] bg-[#eef3ea] shadow-[0_12px_28px_-20px_rgba(31,42,36,0.55)]"
                  : "border-[#eadfcf] bg-white hover:bg-[#f7f3eb]",
              ].join(" ")}
            >
              <p className="text-sm font-semibold text-forest">Real name</p>
              <p className="mt-1 text-xs leading-5 text-muted">Shown as your chosen name only.</p>
            </button>

            <button
              type="button"
              onClick={() => setPrivacyMode(true)}
              className={[
                "rounded-2xl border px-4 py-4 text-left transition",
                privacyMode
                  ? "border-[#7a9272] bg-[#eef3ea] shadow-[0_12px_28px_-20px_rgba(31,42,36,0.55)]"
                  : "border-[#eadfcf] bg-white hover:bg-[#f7f3eb]",
              ].join(" ")}
            >
              <p className="text-sm font-semibold text-forest">Anonymous mode</p>
              <p className="mt-1 text-xs leading-5 text-muted">
                Use a private identity such as {anonymousPreview}.
              </p>
            </button>
          </div>
        </div>

        <div className="mt-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">Guidance style</p>
          <p className="mt-2 text-sm leading-6 text-muted">
            Your course includes both guidance versions. Switch at any time; progress stays with each version.
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setPath("religious")}
              className={[
                "rounded-2xl border px-4 py-4 text-left transition",
                path === "religious"
                  ? "border-[#7a9272] bg-[#eef3ea] shadow-[0_12px_28px_-20px_rgba(31,42,36,0.55)]"
                  : "border-[#eadfcf] bg-white hover:bg-[#f7f3eb]",
              ].join(" ")}
            >
              <p className="text-sm font-semibold text-forest">Religious</p>
              <p className="mt-1 text-xs leading-5 text-muted">Recovery guidance with a spiritual and reflective framing.</p>
            </button>
            <button
              type="button"
              onClick={() => setPath("christian")}
              className={[
                "rounded-2xl border px-4 py-4 text-left transition",
                path === "christian"
                  ? "border-[#7a9272] bg-[#eef3ea] shadow-[0_12px_28px_-20px_rgba(31,42,36,0.55)]"
                  : "border-[#eadfcf] bg-white hover:bg-[#f7f3eb]",
              ].join(" ")}
            >
              <p className="text-sm font-semibold text-forest">Christian</p>
              <p className="mt-1 text-xs leading-5 text-muted">Faith-based encouragement and scripture support.</p>
            </button>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button loading={saving} onClick={handleSaveProfile}>
            Save changes
          </Button>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center justify-center rounded-full border border-[#eadfcf] bg-white px-5 py-3 text-sm font-semibold text-forest transition hover:bg-[#f7f3eb]"
          >
            Log out
          </button>
          <button
            type="button"
            data-profile-danger
            onClick={handleDeleteAccount}
            className="inline-flex items-center justify-center rounded-full border border-[#e2b6b6] bg-[#fff5f5] px-5 py-3 text-sm font-semibold text-[#8e4f4f] transition hover:bg-[#fdecec]"
          >
            Delete account
          </button>
        </div>
        </div>
      </section>

      <aside className={styles.leftRail}>
        <section className={styles.invitation}><PaperSurface seed={74} warm /><PaperPin className={styles.invitationPin} /><div className={styles.invitationContent}>
          <span className={styles.newThread}>Your account</span><h2>Settings that<br />fit your path.</h2><p>Choose the identity, guidance, and reminders that support you best.</p>
        </div></section>
        <section className={styles.kindness}><PaperSurface seed={77} /><PaperPin className={styles.kindnessPin} /><div className={styles.kindnessContent}>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">Account</p>
          <div className="mt-3 space-y-3 text-sm text-muted">
            <p>
              Signed in as <span className="font-semibold text-forest">{email ?? "unknown"}</span>
            </p>
            <p>Mode: <span className="font-semibold text-forest">{privacyMode ? "Anonymous" : "Named"}</span></p>
            <p>Guidance: <span className="font-semibold text-forest">{path === "christian" ? "Christian" : "Religious"}</span></p>
          </div>
        </div></section>

        <section className={styles.kindness}><PaperSurface seed={81} warm /><div className={styles.kindnessContent}>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">What this page controls</p>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-forest">
            <li>- Identity mode and display name</li>
            <li>- Guidance style for the course</li>
            <li>- Notification preferences</li>
            <li>- Account actions</li>
          </ul>
        </div></section>
      </aside>
      </div>
    </div>
  );
}


