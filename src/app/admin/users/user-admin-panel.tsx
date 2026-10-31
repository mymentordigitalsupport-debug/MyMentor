"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Pencil, RotateCcw, ShieldAlert, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import type { AdminUserDetail } from "@/lib/admin/users";
import { formatShortDate } from "@/lib/utils";

type Props = {
  user: AdminUserDetail;
};

async function updateUser(userId: string, body: unknown) {
  const response = await fetch(`/api/admin/users/${userId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const payload = (await response.json().catch(() => null)) as { error?: string } | { success?: boolean } | null;
  if (!response.ok) {
    throw new Error((payload && "error" in payload && payload.error) || "Failed to update user");
  }
}

async function deleteUser(userId: string) {
  const response = await fetch(`/api/admin/users/${userId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ confirm: true }),
  });

  const payload = (await response.json().catch(() => null)) as { error?: string } | { success?: boolean } | null;
  if (!response.ok) {
    throw new Error((payload && "error" in payload && payload.error) || "Failed to delete user");
  }
}

export function UserAdminPanel({ user }: Props) {
  const router = useRouter();
  const [saving, startSaving] = React.useTransition();
  const [displayName, setDisplayName] = React.useState(user.display_name ?? "");
  const [anonymousName, setAnonymousName] = React.useState(user.anonymous_name ?? "");
  const [goal, setGoal] = React.useState(user.goal ?? "");
  const [guidancePath, setGuidancePath] = React.useState(user.guidance_path);
  const [onboardingDone, setOnboardingDone] = React.useState(user.onboarding_done);
  const [message, setMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    setDisplayName(user.display_name ?? "");
    setAnonymousName(user.anonymous_name ?? "");
    setGoal(user.goal ?? "");
    setGuidancePath(user.guidance_path);
    setOnboardingDone(user.onboarding_done);
  }, [user]);

  function handleSave() {
    startSaving(async () => {
      setMessage(null);
      try {
        await updateUser(user.user_id, {
          action: "update",
          display_name: displayName,
          anonymous_name: anonymousName,
          goal,
          guidance_path: guidancePath,
          onboarding_done: onboardingDone,
        });
        setMessage("Profile saved.");
        router.refresh();
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Failed to save profile");
      }
    });
  }

  function handleStatus(action: "suspend" | "reactivate") {
    startSaving(async () => {
    setMessage(null);
    try {
      await updateUser(user.user_id, {
        action,
      });
        setMessage(action === "suspend" ? "User suspended." : "User reactivated.");
        router.refresh();
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Failed to update status");
      }
    });
  }

  function handleAnonymize() {
    if (!window.confirm("Anonymize this user? This will clear visible identity fields.")) return;

    startSaving(async () => {
      setMessage(null);
      try {
        await updateUser(user.user_id, { action: "anonymize" });
        setMessage("User anonymized.");
        router.refresh();
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Failed to anonymize user");
      }
    });
  }

  function handleDelete() {
    if (!window.confirm("Delete this user and all related data? This cannot be undone.")) return;

    startSaving(async () => {
      setMessage(null);
      try {
        await deleteUser(user.user_id);
        router.push("/admin/users");
        router.refresh();
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Failed to delete user");
      }
    });
  }

  return (
    <div className="space-y-6">
      <Card variant="default" padding="lg">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-xl font-semibold text-text">Admin Controls</h2>
              <Badge variant="forest">{user.role} role read-only</Badge>
              <Badge variant={user.account_status === "active" ? "sage" : "gold"}>{user.account_status}</Badge>
            </div>
            <p className="text-sm text-muted">
              Update profile metadata, suspend or reactivate the account, anonymize it, or delete it with confirmation.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={handleSave} loading={saving}>
              <Pencil className="h-4 w-4" />
              Save Changes
            </Button>
            <Button variant="secondary" size="sm" onClick={() => handleStatus("suspend")} loading={saving}>
              <ShieldAlert className="h-4 w-4" />
              Suspend
            </Button>
            <Button variant="secondary" size="sm" onClick={() => handleStatus("reactivate")} loading={saving}>
              <RotateCcw className="h-4 w-4" />
              Reactivate
            </Button>
            <Button variant="secondary" size="sm" onClick={handleAnonymize} loading={saving}>
              <CheckCircle2 className="h-4 w-4" />
              Anonymize
            </Button>
            <Button variant="danger" size="sm" onClick={handleDelete} loading={saving}>
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
        {message ? <p className="mt-4 text-sm text-muted">{message}</p> : null}
      </Card>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card variant="default" padding="lg">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-muted">Editable profile fields</p>
              <h2 className="mt-1 text-lg font-semibold text-text">Profile</h2>
            </div>
          </div>

          <div className="mt-5 grid gap-4">
            <Input label="Display name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} />
            <Input
              label="Anonymous name"
              value={anonymousName}
              onChange={(event) => setAnonymousName(event.target.value)}
            />
            <Textarea label="Goal" value={goal} onChange={(event) => setGoal(event.target.value)} />

            <label className="grid gap-2">
              <span className="text-sm font-medium text-text">Guidance path</span>
              <select
                value={guidancePath}
                onChange={(event) => setGuidancePath(event.target.value as "christian" | "religious")}
                className="h-11 rounded-2xl border border-mist bg-cream px-3 text-sm text-text outline-none focus:border-sage"
              >
                <option value="christian">Christian</option>
                <option value="religious">Religious</option>
              </select>
            </label>

            <label className="flex items-center gap-3 rounded-2xl border border-mist bg-cream px-3 py-3">
              <input
                type="checkbox"
                checked={onboardingDone}
                onChange={(event) => setOnboardingDone(event.target.checked)}
                className="h-4 w-4 rounded border-mist text-sage focus:ring-sage"
              />
              <span className="text-sm text-text">Onboarding complete</span>
            </label>

          </div>
        </Card>

        <div className="space-y-6">
          <Card variant="default" padding="lg">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-muted">User progress</p>
                <h2 className="mt-1 text-lg font-semibold text-text">Course and lesson activity</h2>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {user.course_progress.length > 0 ? (
                user.course_progress.map((progress) => (
                  <div key={progress.course_version_id} className="rounded-3xl border border-mist/70 bg-cream p-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="font-semibold text-text">{progress.course_title ?? "Untitled course"}</p>
                      <Badge variant="forest">{progress.guidance_path}</Badge>
                    </div>
                    <p className="mt-2 text-sm text-muted">{progress.version_title ?? "Untitled version"}</p>
                    <p className="mt-1 text-xs text-muted">
                      Started {formatShortDate(progress.started_at)} · Active {formatShortDate(progress.last_active_at)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted">No course progress yet.</p>
              )}
            </div>
          </Card>

          <Card variant="default" padding="lg">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-muted">Privacy-safe metadata</p>
                <h2 className="mt-1 text-lg font-semibold text-text">Activity counts</h2>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Card variant="mist" padding="sm">
                <p className="text-xs uppercase tracking-[0.14em] text-muted">Journal entries</p>
                <p className="mt-2 text-2xl font-semibold text-text">{user.journal_count}</p>
              </Card>
              <Card variant="mist" padding="sm">
                <p className="text-xs uppercase tracking-[0.14em] text-muted">Mood check-ins</p>
                <p className="mt-2 text-2xl font-semibold text-text">{user.mood_count}</p>
              </Card>
              <Card variant="mist" padding="sm">
                <p className="text-xs uppercase tracking-[0.14em] text-muted">Saved insights</p>
                <p className="mt-2 text-2xl font-semibold text-text">{user.saved_insight_count}</p>
              </Card>
              <Card variant="mist" padding="sm">
                <p className="text-xs uppercase tracking-[0.14em] text-muted">Lessons completed</p>
                <p className="mt-2 text-2xl font-semibold text-text">{user.lesson_completed_count}</p>
              </Card>
            </div>
          </Card>
        </div>
      </section>

      <Card variant="default" padding="lg">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-muted">Identity</p>
            <h2 className="mt-1 text-lg font-semibold text-text">Audit fields</h2>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <Card variant="mist" padding="sm">
            <p className="text-xs uppercase tracking-[0.14em] text-muted">Profile created</p>
            <p className="mt-2 text-sm font-semibold text-text">{formatShortDate(user.profile_created_at)}</p>
          </Card>
          <Card variant="mist" padding="sm">
            <p className="text-xs uppercase tracking-[0.14em] text-muted">Account status updated</p>
            <p className="mt-2 text-sm font-semibold text-text">
              {formatShortDate(user.account_status_updated_at)}
            </p>
          </Card>
          <Card variant="mist" padding="sm">
            <p className="text-xs uppercase tracking-[0.14em] text-muted">Last sign in</p>
            <p className="mt-2 text-sm font-semibold text-text">
              {user.last_sign_in_at ? formatShortDate(user.last_sign_in_at) : "Never"}
            </p>
          </Card>
        </div>
      </Card>
    </div>
  );
}

