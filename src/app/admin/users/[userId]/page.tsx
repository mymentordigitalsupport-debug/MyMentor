import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getAdminUserDetail } from "@/lib/admin/users";
import { formatShortDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

function formatDuration(durationMs: number) {
  const totalSeconds = Math.max(0, Math.round(durationMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes === 0) return `${seconds}s`;
  return `${minutes}m ${seconds}s`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ userId: string }>;
}): Promise<Metadata> {
  const { userId } = await params;
  const user = await getAdminUserDetail(userId);

  return {
    title: user ? `${user.display_name ?? user.anonymous_name ?? "User"} | Users` : "User Detail",
    description: "Admin user detail.",
  };
}

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const user = await getAdminUserDetail(userId);

  if (!user) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Button asChild variant="secondary" size="sm">
        <Link href="/admin/users">
          <ArrowLeft className="h-4 w-4" />
          Back to Users
        </Link>
      </Button>

      <Card variant="default" padding="lg">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold text-text">
              {user.display_name ?? user.anonymous_name ?? "Unnamed user"}
            </h1>
            <Badge variant="forest">{user.guidance_path}</Badge>
            <Badge variant={user.profile.is_anonymous ? "gold" : "sage"}>
              Anonymous mode {user.profile.is_anonymous ? "true" : "false"}
            </Badge>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <Card variant="mist" padding="sm">
              <p className="text-xs uppercase tracking-[0.14em] text-muted">Lessons completed</p>
              <p className="mt-2 text-2xl font-semibold text-text">{user.lesson_completed_count}</p>
            </Card>
            <Card variant="mist" padding="sm">
              <p className="text-xs uppercase tracking-[0.14em] text-muted">Chapters completed</p>
              <p className="mt-2 text-2xl font-semibold text-text">{user.chapters_completed_count}</p>
            </Card>
            <Card variant="mist" padding="sm">
              <p className="text-xs uppercase tracking-[0.14em] text-muted">Active courses</p>
              <p className="mt-2 text-2xl font-semibold text-text">{user.active_courses_count}</p>
            </Card>
            <Card variant="mist" padding="sm">
              <p className="text-xs uppercase tracking-[0.14em] text-muted">Name</p>
              <p className="mt-2 text-sm font-semibold text-text">
                {user.display_name ?? user.anonymous_name ?? "None"}
              </p>
            </Card>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <Card variant="mist" padding="sm">
              <p className="text-xs uppercase tracking-[0.14em] text-muted">Email</p>
              <p className="mt-2 text-sm font-semibold text-text">{user.email ?? "None"}</p>
            </Card>
            <Card variant="mist" padding="sm">
              <p className="text-xs uppercase tracking-[0.14em] text-muted">Phone number</p>
              <p className="mt-2 text-sm font-semibold text-text">{user.auth?.phone ?? "None"}</p>
            </Card>
          </div>
        </div>
      </Card>

      <Card variant="default" padding="lg">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-muted">Profile</p>
          <h2 className="mt-1 text-lg font-semibold text-text">Saved profile fields</h2>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <Card variant="mist" padding="sm"><p className="text-xs uppercase tracking-[0.14em] text-muted">Profile ID</p><p className="mt-2 text-sm font-semibold break-all text-text">{user.profile.id}</p></Card>
          <Card variant="mist" padding="sm"><p className="text-xs uppercase tracking-[0.14em] text-muted">User ID</p><p className="mt-2 text-sm font-semibold break-all text-text">{user.profile.user_id}</p></Card>
          <Card variant="mist" padding="sm"><p className="text-xs uppercase tracking-[0.14em] text-muted">Username</p><p className="mt-2 text-sm font-semibold text-text">{user.profile.username ?? "None"}</p></Card>
          <Card variant="mist" padding="sm"><p className="text-xs uppercase tracking-[0.14em] text-muted">Display mode</p><p className="mt-2 text-sm font-semibold text-text">{user.profile.display_name_mode ?? "None"}</p></Card>
          <Card variant="mist" padding="sm"><p className="text-xs uppercase tracking-[0.14em] text-muted">Display name</p><p className="mt-2 text-sm font-semibold text-text">{user.profile.display_name ?? "None"}</p></Card>
          <Card variant="mist" padding="sm"><p className="text-xs uppercase tracking-[0.14em] text-muted">Anonymous name</p><p className="mt-2 text-sm font-semibold text-text">{user.profile.anonymous_name ?? "None"}</p></Card>
          <Card variant="mist" padding="sm"><p className="text-xs uppercase tracking-[0.14em] text-muted">Preferred path</p><p className="mt-2 text-sm font-semibold text-text">{user.profile.preferred_guidance_path}</p></Card>
          <Card variant="mist" padding="sm"><p className="text-xs uppercase tracking-[0.14em] text-muted">Selected course</p><p className="mt-2 text-sm font-semibold break-all text-text">{user.profile.selected_course_id ?? "None"}</p></Card>
          <Card variant="mist" padding="sm"><p className="text-xs uppercase tracking-[0.14em] text-muted">Personal goal</p><p className="mt-2 text-sm font-semibold text-text">{user.profile.personal_goal ?? "None"}</p></Card>
          <Card variant="mist" padding="sm"><p className="text-xs uppercase tracking-[0.14em] text-muted">Mood baseline</p><p className="mt-2 text-sm font-semibold text-text">{user.profile.mood_baseline ?? "None"}</p></Card>
          <Card variant="mist" padding="sm"><p className="text-xs uppercase tracking-[0.14em] text-muted">Onboarding step</p><p className="mt-2 text-sm font-semibold text-text">{user.profile.onboarding_step ?? "None"}</p></Card>
          <Card variant="mist" padding="sm"><p className="text-xs uppercase tracking-[0.14em] text-muted">Onboarding complete</p><p className="mt-2 text-sm font-semibold text-text">{user.profile.onboarding_completed ? "Yes" : "No"}</p></Card>
          <Card variant="mist" padding="sm"><p className="text-xs uppercase tracking-[0.14em] text-muted">Completed at</p><p className="mt-2 text-sm font-semibold text-text">{user.profile.onboarding_completed_at ? formatShortDate(user.profile.onboarding_completed_at) : "None"}</p></Card>
          <Card variant="mist" padding="sm"><p className="text-xs uppercase tracking-[0.14em] text-muted">Status</p><p className="mt-2 text-sm font-semibold text-text">{user.profile.status ?? "None"}</p></Card>
          <Card variant="mist" padding="sm"><p className="text-xs uppercase tracking-[0.14em] text-muted">Updated</p><p className="mt-2 text-sm font-semibold text-text">{formatShortDate(user.profile.updated_at)}</p></Card>
        </div>
      </Card>

      <Card variant="default" padding="lg">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-muted">Active courses</p>
          <h2 className="mt-1 text-lg font-semibold text-text">Current course links</h2>
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
                  Started {formatShortDate(progress.started_at)} - Active {formatShortDate(progress.last_active_at)}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted">No active courses yet.</p>
          )}
        </div>
      </Card>

      <Card variant="default" padding="lg">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-muted">Lesson answers</p>
          <h2 className="mt-1 text-lg font-semibold text-text">What the user filled in</h2>
        </div>

        <div className="mt-5 space-y-4">
          {user.journal_entries.length === 0 &&
          user.mood_checkins.length === 0 &&
          user.saved_insights.length === 0 &&
          user.quiz_answers.length === 0 ? (
            <p className="text-sm text-muted">No lesson answers saved yet.</p>
          ) : null}

          {user.journal_entries.map((entry) => (
            <article key={entry.id} className="rounded-3xl border border-mist/70 bg-cream p-4">
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="sage">Journal</Badge>
                <span className="text-xs text-muted">{formatShortDate(entry.created_at)}</span>
                <span className="text-xs text-muted">Lesson {entry.lesson_id ?? "None"}</span>
              </div>
              <p className="mt-3 text-sm font-semibold text-text">{entry.title ?? "Journal entry"}</p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-text">{entry.body}</p>
            </article>
          ))}

          {user.mood_checkins.map((checkin) => (
            <article key={checkin.id} className="rounded-3xl border border-mist/70 bg-cream p-4">
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="gold">Mood</Badge>
                <span className="text-xs text-muted">{formatShortDate(checkin.created_at)}</span>
                <span className="text-xs text-muted">Lesson {checkin.lesson_id ?? "None"}</span>
              </div>
              <p className="mt-3 text-sm font-semibold capitalize text-text">{checkin.mood}</p>
              <p className="mt-2 text-sm leading-6 text-text">{checkin.note ?? "No note"}</p>
            </article>
          ))}

          {user.saved_insights.map((insight) => (
            <article key={insight.id} className="rounded-3xl border border-mist/70 bg-cream p-4">
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="forest">Insight</Badge>
                <span className="text-xs text-muted">{formatShortDate(insight.created_at)}</span>
                <span className="text-xs text-muted">Lesson {insight.lesson_id ?? "None"}</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-text">{insight.text}</p>
            </article>
          ))}

          {user.quiz_answers.map((answer) => (
            <article key={answer.id} className="rounded-3xl border border-mist/70 bg-cream p-4">
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant={answer.is_correct ? "sage" : "gold"}>Quiz</Badge>
                <span className="text-xs text-muted">{formatShortDate(answer.answered_at)}</span>
                <span className="text-xs text-muted">{answer.lesson_title ?? "Unknown lesson"}</span>
              </div>
              <p className="mt-3 text-sm font-semibold text-text">{answer.question_text}</p>
              <p className="mt-2 text-sm text-text">Selected: {answer.selected_answer}</p>
              <p className="mt-1 text-sm text-muted">Correct: {answer.correct_answer ?? "None"}</p>
            </article>
          ))}
        </div>
      </Card>

      <Card variant="default" padding="lg">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-muted">Step timing</p>
          <h2 className="mt-1 text-lg font-semibold text-text">How long each step took</h2>
        </div>

        <div className="mt-5 space-y-3">
          {user.step_durations.length > 0 ? (
            user.step_durations.map((step) => (
              <div key={`${step.lesson_id}-${step.step_key}-${step.step_order ?? 0}`} className="rounded-3xl border border-mist/70 bg-cream p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-text">{step.lesson_title ?? "Unknown lesson"}</p>
                    <p className="mt-1 text-sm text-muted">
                      Step {step.step_order ?? "?"} - {step.step_key}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-forest">{formatDuration(step.duration_ms)}</p>
                    <p className="text-xs text-muted">{step.visits} visit{step.visits === 1 ? "" : "s"}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted">No step timing saved yet.</p>
          )}
        </div>
      </Card>
    </div>
  );
}
