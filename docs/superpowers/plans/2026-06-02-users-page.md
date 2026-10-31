# Users Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a live admin Users page with profile-level control actions for suspend, reactivate, anonymize, and delete, while keeping role read-only.

**Architecture:** Add a small `profiles` schema extension to store user account state, then expose admin-only server routes for user actions. The Users page will read from `profiles` plus progress/activity tables to render a searchable directory, user detail view, and metadata-only activity summary. Hard delete will stay a separate service-role action; normal admin control flows will update `profiles` only.

**Tech Stack:** Next.js App Router, Supabase SSR, Supabase service-role client, PostgreSQL migration, server actions or route handlers, TypeScript.

---

### Task 1: Add profile account status to the database

**Files:**
- Create: `supabase/migrations/20260602000001_profile_account_status.sql`

- [ ] **Step 1: Add the schema columns**

```sql
alter table public.profiles
  add column if not exists account_status text not null default 'active',
  add column if not exists account_status_reason text,
  add column if not exists account_status_updated_at timestamptz not null default now(),
  add column if not exists anonymized_at timestamptz;
```

- [ ] **Step 2: Add a status constraint**

```sql
alter table public.profiles
  add constraint profiles_account_status_check
  check (account_status in ('active', 'suspended', 'disabled', 'anonymized'));
```

- [ ] **Step 3: Verify the migration shape**

Run: `npm.cmd run build`
Expected: existing app errors only, no schema syntax errors from the new migration.

### Task 2: Add admin routes for user control

**Files:**
- Create: `src/app/api/admin/users/route.ts`
- Create: `src/app/api/admin/users/[userId]/route.ts`

- [ ] **Step 1: Implement list/get handlers**

```ts
export async function GET() {
  // Return profile rows plus aggregates from user_course_progress, user_lesson_progress,
  // journal_entries, mood_checkins, and saved_insights.
}
```

- [ ] **Step 2: Implement suspend/reactivate/anonymize/delete handlers**

```ts
export async function PATCH(request: NextRequest, { params }: { params: { userId: string } }) {
  // Update profiles.account_status, account_status_reason, account_status_updated_at,
  // and anonymized fields for anonymize.
}

export async function DELETE(request: NextRequest, { params }: { params: { userId: string } }) {
  // Delete profile data and auth user only for confirmed hard-delete cases.
}
```

- [ ] **Step 3: Verify admin authentication**

Run: `npm.cmd run build`
Expected: routes compile and still rely on the existing admin guard pattern.

### Task 3: Build the Users directory page

**Files:**
- Create: `src/app/admin/users/page.tsx`

- [ ] **Step 1: Query profiles and aggregates**

```ts
// Use createSupabaseServerClient or the admin client helper.
// Load profiles, course progress counts, lesson progress counts, journal counts, mood counts, and saved insights.
```

- [ ] **Step 2: Render summary cards and a searchable list**

```tsx
// Summary cards: total, active, suspended, anonymous, named, onboarding complete.
// List columns: display name, anonymous name, guidance path, journey, onboarding, joined, last active, status, role.
```

- [ ] **Step 3: Add action buttons**

```tsx
// Suspend, reactivate, anonymize, delete, view details.
// Role is visible only, not editable.
```

- [ ] **Step 4: Verify the page**

Run: `npm.cmd run build`
Expected: page compiles and uses no mock data.

### Task 4: Build the user detail page

**Files:**
- Create: `src/app/admin/users/[userId]/page.tsx`

- [ ] **Step 1: Fetch the selected user and metadata**

```ts
// Load the profile row plus aggregates and recent progress metadata.
```

- [ ] **Step 2: Render the detail sections**

```tsx
// Profile info, journey progress summary, lesson progress summary, journal metadata, mood counts, saved insights.
```

- [ ] **Step 3: Add the same control actions**

```tsx
// Suspend, reactivate, anonymize, delete, edit profile fields.
```

- [ ] **Step 4: Verify the page**

Run: `npm.cmd run build`
Expected: detail page compiles and matches the directory page’s action model.

### Task 5: Add sidebar and type updates

**Files:**
- Modify: `src/components/layout/AdminSidebar.tsx`
- Modify: `src/types/index.ts`
- Modify: `src/app/admin/page.tsx` if needed for user quick links

- [ ] **Step 1: Add the Users nav item**

```ts
{ href: "/admin/users", label: "Users", emoji: "👥" }
```

- [ ] **Step 2: Add profile status typing**

```ts
export type AccountStatus = "active" | "suspended" | "disabled" | "anonymized";
```

- [ ] **Step 3: Verify nav and type usage**

Run: `npm.cmd run build`
Expected: the new route appears in navigation and type imports stay consistent.

### Task 6: Verification sweep

**Files:**
- Validate: `src/app/admin/users/page.tsx`
- Validate: `src/app/admin/users/[userId]/page.tsx`
- Validate: `src/app/api/admin/users/route.ts`
- Validate: `src/app/api/admin/users/[userId]/route.ts`
- Validate: `supabase/migrations/20260602000001_profile_account_status.sql`

- [ ] **Step 1: Search for stale mock references**

Run: `rg -n "demo-data|mock|users" src/app/admin src/app/api/admin`

- [ ] **Step 2: Run the build**

Run: `npm.cmd run build`
Expected: only pre-existing unrelated lint failures remain, if any.

