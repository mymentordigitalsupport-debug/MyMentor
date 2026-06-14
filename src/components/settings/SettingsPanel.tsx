"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/ToastProvider";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { type GuidancePath, ANONYMOUS_NAMES } from "@/types";
import { randomAnonymousName } from "@/lib/utils";

interface SettingsPanelProps {
  userId: string;
  email: string | null;
  displayName: string;
  anonymousName: string | null;
  isAnonymous: boolean;
  guidancePath: GuidancePath;
}

const LOCAL_NOTIFICATION_KEYS = {
  dailyReminder: "mymentor.notifications.dailyReminder",
  mentorMessages: "mymentor.notifications.mentorMessages",
  progressCheckIn: "mymentor.notifications.progressCheckIn",
} as const;

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
  const [dailyReminder, setDailyReminder] = useState(false);
  const [mentorMessages, setMentorMessages] = useState(true);
  const [progressCheckIn, setProgressCheckIn] = useState(true);
  const anonymousPreview = useMemo(
    () => anonymousName ?? randomAnonymousName(ANONYMOUS_NAMES),
    [anonymousName]
  );

  useEffect(() => {
    try {
      setDailyReminder(window.localStorage.getItem(LOCAL_NOTIFICATION_KEYS.dailyReminder) === "true");
      setMentorMessages(window.localStorage.getItem(LOCAL_NOTIFICATION_KEYS.mentorMessages) !== "false");
      setProgressCheckIn(window.localStorage.getItem(LOCAL_NOTIFICATION_KEYS.progressCheckIn) !== "false");
    } catch {
      // Ignore storage errors.
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(LOCAL_NOTIFICATION_KEYS.dailyReminder, String(dailyReminder));
    } catch {
      // Ignore storage errors.
    }
  }, [dailyReminder]);

  useEffect(() => {
    try {
      window.localStorage.setItem(LOCAL_NOTIFICATION_KEYS.mentorMessages, String(mentorMessages));
    } catch {
      // Ignore storage errors.
    }
  }, [mentorMessages]);

  useEffect(() => {
    try {
      window.localStorage.setItem(LOCAL_NOTIFICATION_KEYS.progressCheckIn, String(progressCheckIn));
    } catch {
      // Ignore storage errors.
    }
  }, [progressCheckIn]);

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
          preferred_guidance_path: path,
          display_name_mode: privacyMode ? "nickname" : "real_name",
        })
        .eq("id", userId);

      if (error) throw error;

      setName(nextDisplayName);
      toast.success("Settings saved", "Your profile preferences were updated.");
      router.refresh();
    } catch {
      toast.error("Save failed", "Please try again.");
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
      const response = await fetch("/api/auth/delete-account", { method: "POST" });
      if (!response.ok) throw new Error("Delete failed");
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Delete failed", "Please try again.");
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
      <section className="rounded-[24px] border border-[#eadfcf] bg-[#fbf9f5]/95 p-5 shadow-[0_18px_36px_-26px_rgba(31,42,36,0.28)]">
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

        <div className="mt-6 rounded-2xl border border-[#eadfcf] bg-white/80 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">Notifications</p>
          <div className="mt-3 space-y-3">
            {[
              {
                label: "Daily reminder",
                description: "A gentle nudge to check in each day.",
                checked: dailyReminder,
                onChange: setDailyReminder,
              },
              {
                label: "Mentor messages",
                description: "Receive encouragement from the app.",
                checked: mentorMessages,
                onChange: setMentorMessages,
              },
              {
                label: "Progress updates",
                description: "Keep track of small wins and milestones.",
                checked: progressCheckIn,
                onChange: setProgressCheckIn,
              },
            ].map((item) => (
              <label
                key={item.label}
                className="flex items-start justify-between gap-4 rounded-2xl border border-[#eadfcf] bg-[#fdfbf7] px-4 py-3"
              >
                <span>
                  <span className="block text-sm font-semibold text-forest">{item.label}</span>
                  <span className="mt-1 block text-xs leading-5 text-muted">{item.description}</span>
                </span>
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={(event) => item.onChange(event.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-sage/40 text-sage focus:ring-sage/50"
                />
              </label>
            ))}
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
            onClick={handleDeleteAccount}
            className="inline-flex items-center justify-center rounded-full border border-[#e2b6b6] bg-[#fff5f5] px-5 py-3 text-sm font-semibold text-[#8e4f4f] transition hover:bg-[#fdecec]"
          >
            Delete account
          </button>
        </div>
      </section>

      <aside className="space-y-4">
        <section className="rounded-[24px] border border-[#eadfcf] bg-[#fbf9f5]/95 p-5 shadow-[0_18px_36px_-26px_rgba(31,42,36,0.28)]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">Account</p>
          <div className="mt-3 space-y-3 text-sm text-muted">
            <p>
              Signed in as <span className="font-semibold text-forest">{email ?? "unknown"}</span>
            </p>
            <p>Mode: <span className="font-semibold text-forest">{privacyMode ? "Anonymous" : "Named"}</span></p>
            <p>Guidance: <span className="font-semibold text-forest">{path === "christian" ? "Christian" : "Religious"}</span></p>
          </div>
        </section>

        <section className="rounded-[24px] border border-[#eadfcf] bg-[#fdfbf7] p-5 shadow-[0_18px_36px_-26px_rgba(31,42,36,0.22)]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">What this page controls</p>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-forest">
            <li>- Identity mode and display name</li>
            <li>- Guidance style for the course</li>
            <li>- Notification preferences</li>
            <li>- Account actions</li>
          </ul>
        </section>
      </aside>
    </div>
  );
}


