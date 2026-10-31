import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Plus, Search, Users } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { AuthorApplicationActions } from "@/components/admin/AuthorApplicationActions";
import { formatShortDate } from "@/lib/utils";
import { getAdminUsersDirectory } from "@/lib/admin/users";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Users",
  description: "Live admin directory for platform users and account controls.",
};

function statusTone(status: string) {
  switch (status) {
    case "active":
      return "sage";
    case "suspended":
      return "gold";
    case "disabled":
      return "muted";
    default:
      return "forest";
  }
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; path?: string }>;
}) {
  const { q, status = "all", path = "all" } = await searchParams;
  const directory = await getAdminUsersDirectory();

  const query = q?.trim().toLowerCase() ?? "";
  const users = directory.users.filter((user) => {
    const matchesQuery =
      !query ||
      [user.display_name, user.anonymous_name, user.email, user.user_id]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(query));

    const matchesStatus = status === "all" ? true : user.account_status === status;
    const matchesPath = path === "all" ? true : user.guidance_path === path;

    return matchesQuery && matchesStatus && matchesPath;
  });

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <Badge variant="forest">Live data</Badge>
          <div>
            <h1 className="text-2xl font-semibold text-text">Users</h1>
            <p className="text-sm text-muted">
              Admin control for profiles, status, guidance path, and user progress. Role is read-only.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button asChild variant="primary" size="sm">
            <Link href="/admin/users">
              <Plus className="h-4 w-4" />
              Refresh
            </Link>
          </Button>
          <Button asChild variant="secondary" size="sm">
            <Link href="/admin/flow">
              <Users className="h-4 w-4" />
              View Flow
            </Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total users", value: String(directory.stats.total) },
          { label: "Active", value: String(directory.stats.active) },
          { label: "Suspended", value: String(directory.stats.suspended) },
          { label: "Anonymous", value: String(directory.stats.anonymous) },
          { label: "Named", value: String(directory.stats.named) },
          { label: "Onboarding done", value: String(directory.stats.onboardingDone) },
          { label: "Disabled", value: String(directory.stats.disabled) },
          { label: "Anonymized", value: String(directory.stats.anonymized) },
        ].map((stat) => (
          <Card key={stat.label} variant="default">
            <p className="text-xs uppercase tracking-[0.14em] text-muted">{stat.label}</p>
            <p className="mt-2 text-3xl font-semibold text-text">{stat.value}</p>
          </Card>
        ))}
      </section>

      <Card variant="default" padding="lg">
        <form className="grid gap-3 md:grid-cols-[1.2fr_0.45fr_0.45fr_auto]">
          <label className="relative">
            <span className="sr-only">Search users</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              name="q"
              defaultValue={q ?? ""}
              placeholder="Search by name, email, or user ID"
              className="h-11 w-full rounded-2xl border border-mist bg-cream pl-9 pr-3 text-sm text-text outline-none transition-colors placeholder:text-muted focus:border-sage"
            />
          </label>

          <select
            name="status"
            defaultValue={status}
            className="h-11 rounded-2xl border border-mist bg-cream px-3 text-sm text-text outline-none focus:border-sage"
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="disabled">Disabled</option>
            <option value="anonymized">Anonymized</option>
          </select>

          <select
            name="path"
            defaultValue={path}
            className="h-11 rounded-2xl border border-mist bg-cream px-3 text-sm text-text outline-none focus:border-sage"
          >
            <option value="all">All guidance paths</option>
            <option value="christian">Christian</option>
            <option value="religious">Religious</option>
          </select>

          <Button variant="secondary" size="sm" type="submit">
            Apply filters
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>
      </Card>

      <section className="space-y-4">
        {users.length > 0 ? (
          users.map((user) => {
            const isAuthor = ["author_pending", "author", "author_rejected"].includes(user.role);
            const application = user.author_application;

            return <Card key={user.user_id} variant="default" padding="lg">
              <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-semibold text-text">
                      {application?.public_name ?? user.display_name ?? user.anonymous_name ?? (isAuthor ? "Unnamed author" : "Unnamed user")}
                    </h2>
                    <Badge variant={statusTone(user.account_status)}>{user.account_status}</Badge>
                    <Badge variant="forest">{isAuthor ? "Author application" : user.role}</Badge>
                    {isAuthor ? <Badge variant={application?.status === "approved" ? "sage" : "gold"}>{application?.status ?? "Application details missing"}</Badge> : null}
                  </div>

                  <div className="flex flex-wrap gap-2 text-sm text-muted">
                    <span>{user.email ?? "No email visible"}</span>
                    {isAuthor ? <><span>-</span><span>{application ? `Applied ${formatShortDate(application.created_at)}` : "No application record"}</span></> : <><span>-</span><span>{user.guidance_path}</span><span>-</span><span>{user.active_journey_title ?? "No active course"}</span></>}
                  </div>

                  {isAuthor ? <div className="flex flex-wrap gap-2"><Badge variant="sage">Joined {formatShortDate(user.auth_created_at ?? user.profile_created_at)}</Badge>{application?.intended_topics.map((topic) => <Badge key={topic} variant="muted">{topic}</Badge>)}</div> : <div className="flex flex-wrap gap-2"><Badge variant="sage">Joined {formatShortDate(user.auth_created_at ?? user.profile_created_at)}</Badge><Badge variant="gold">Last active {user.active_last_active_at ? formatShortDate(user.active_last_active_at) : "N/A"}</Badge><Badge variant="muted">Lessons {user.lesson_completed_count}/{user.lesson_started_count}</Badge></div>}
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:w-[420px]">
                  {isAuthor ? <><Card variant="mist" padding="sm"><p className="text-xs uppercase tracking-[0.14em] text-muted">Author status</p><p className="mt-2 text-sm font-semibold capitalize text-text">{application?.status ?? "Missing application"}</p></Card><Card variant="mist" padding="sm"><p className="text-xs uppercase tracking-[0.14em] text-muted">Writing topics</p><p className="mt-2 text-sm font-semibold text-text">{application?.intended_topics.length ?? 0}</p></Card><Card variant="mist" padding="sm" className="sm:col-span-2"><p className="text-xs uppercase tracking-[0.14em] text-muted">Experience or expertise</p><p className="mt-2 line-clamp-2 text-sm text-text">{application?.expertise_summary ?? "No application details have been recorded."}</p></Card></> : <><Card variant="mist" padding="sm"><p className="text-xs uppercase tracking-[0.14em] text-muted">Journal entries</p><p className="mt-2 text-2xl font-semibold text-text">{user.journal_count}</p></Card><Card variant="mist" padding="sm"><p className="text-xs uppercase tracking-[0.14em] text-muted">Mood check-ins</p><p className="mt-2 text-2xl font-semibold text-text">{user.mood_count}</p></Card><Card variant="mist" padding="sm"><p className="text-xs uppercase tracking-[0.14em] text-muted">Saved insights</p><p className="mt-2 text-2xl font-semibold text-text">{user.saved_insight_count}</p></Card><Card variant="mist" padding="sm"><p className="text-xs uppercase tracking-[0.14em] text-muted">Onboarding</p><p className="mt-2 text-sm font-semibold text-text">{user.onboarding_done ? "Complete" : "Incomplete"}</p></Card></>}
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <Button asChild variant="secondary" size="sm">
                  <Link href={`/admin/users/${user.user_id}`}>
                    {isAuthor ? "View application" : "View User"}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                {isAuthor ? application?.status === "pending" ? <AuthorApplicationActions applicationId={application.id} /> : null : <><Button asChild variant="secondary" size="sm"><Link href={`/admin/users/${user.user_id}`}>Edit Profile</Link></Button><Button asChild variant="secondary" size="sm"><Link href="/admin/courses">View Course</Link></Button></>}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted">
                {isAuthor ? <><span>Application {application ? `received ${formatShortDate(application.created_at)}` : "record missing"}</span><span>{application?.status === "pending" ? "Awaiting an editorial decision" : "Editorial decision recorded"}</span></> : <><span>Profile updated {formatShortDate(user.profile_updated_at)}</span><span>Account status {formatShortDate(user.account_status_updated_at)}</span><span>Role locked</span></>}
              </div>
            </Card>
          })
        ) : (
          <Card variant="default" padding="lg">
            <p className="text-sm text-muted">No users matched the current filters.</p>
          </Card>
        )}
      </section>
    </div>
  );
}

