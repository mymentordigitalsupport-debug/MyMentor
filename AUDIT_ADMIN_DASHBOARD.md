# Admin Dashboard Final Audit

Date: 2026-11-15

## Implementation update

Code hardening completed after this audit:

- Fixed course creation to use the live lowercase `chapters` table.
- Prevented Lesson Builder from merging or overwriting rich block types.
- Enforced disabled account status in middleware, layouts, APIs, and portal access.
- Added trusted-origin checks to all administrator mutation routes.
- Added real logout and mobile administrator navigation.
- Made Media audio-only with private signed uploads, playback, and deletion.
- Made Resources a document-only library with upload, draft/publish, ordering, editing, and deletion.
- Unregistered Storage files no longer auto-publish to members.
- Reworked user deletion to preserve authored articles and rely on database cascades.
- Updated Next.js and PostCSS; production audit now has zero critical/high findings.
- TypeScript and production build pass.
- Reversible live database tests confirmed course hierarchy, resource, and audio data contracts; cleanup left zero test records.

One deployment action remains: run `supabase/migrations/20261115000000_admin_production_hardening.sql`. Until that SQL is applied, live role escalation remains possible and the private Media bucket does not exist.

## Verdict

**Not production-ready. Do not hand the dashboard to an administrator until the two critical blockers below are fixed and retested.**

The dashboard renders, authenticates, reads live data, and several mutation flows work. However, the live database currently permits a normal authenticated member to promote their own profile role to `admin`. Course creation also fails on every attempt.

## Test method

- Used the current `.env.local` configuration without printing secrets.
- Ran the production build, TypeScript compiler, lint, dependency audit, authenticated HTTP route checks, live Supabase schema/data checks, and reversible mutation tests.
- Temporary test records were isolated and removed in cleanup blocks.
- Existing bank settings were snapshotted and restored after testing.
- Final scans confirmed zero temporary test users, profiles, courses, lessons, resources, topics, or articles.
- The isolated audit server and cache were removed.

## Critical blockers

### 1. Normal members can promote themselves to admin

Live test result:

- Created a temporary normal authenticated user.
- Updated that user's own `profiles.role` from `user` to `admin` through the public authenticated Supabase client.
- Update succeeded and returned the changed row.
- Read-back confirmed `role = admin`.
- Temporary user and profile were deleted afterward.

Impact:

- Any signed-in member can gain full administrator access.
- Admin page/API authorization trusts `profiles.role`, so this is a complete privilege escalation.

Repository status:

- `supabase/migrations/20261030000000_security_p0_rls_and_roles.sql` contains protections for this issue.
- Those protections are not active in the live database.

Required action:

- Apply and verify the profile privilege/RLS security migration before production use.
- Retest self-promotion and confirm the request is rejected and the role remains `user`.

**SQL/database action is required for this blocker.**

### 2. Course/book creation is broken

Live API test result:

- `POST /api/admin/courses` returned `500`.
- Error: `Could not find the table 'public.Chapters' in the schema cache`.
- The live table is `public.chapters`.
- The API uses `.from("Chapters")` with the wrong case.
- Cleanup worked: course count stayed at 3 and no temporary course remained.

Impact:

- Admin cannot create a new book/course.
- Journey creation is also affected because it reuses the same endpoint.

Required action:

- Change the API table name to `chapters`.
- Retest complete course, version, chapter, and lesson creation.

**Code change only. No schema change required for this blocker.**

## High-priority problems

### Lesson Builder can damage existing lesson structure

The basic save endpoint works on a clean temporary lesson, but existing lessons contain richer multi-block structures.

Problems:

- The editor combines `reading`, `mentor_note`, `scripture`, and `quote` blocks into one text field.
- Saving writes the combined text into only the first matching block and leaves the other blocks unchanged.
- Repeated saves can duplicate or mix content.
- Saving creates a `video` block, but the editor reload logic only reads `mentor_video` and `audio`; saved video data may disappear from the editor after refresh.
- Existing lessons average 13 blocks, while the builder writes only 6 canonical blocks.

Status: persistence works, but it is unsafe for editing existing production lessons until block mapping is corrected and round-trip tested.

### User suspension does not block access

- Admin suspension changes `profiles.status` to `paused`.
- Login, middleware, portal-access, and protected layouts do not enforce profile status.
- A suspended user can continue signing in and using the app.

Status: button/API works as a database update; the intended suspension behavior does not function.

### User deletion is incomplete and non-atomic

The delete endpoint manually removes only journal, mood, insight, course-progress, lesson-progress, and profile rows before deleting the Auth user.

It does not explicitly handle newer related records such as payments, proofs, entitlements, thread activity, article applications/articles, and other possible foreign-key dependencies. A failure can leave partial deletion because the operation is not transactional.

Status: unsafe to rely on for production account deletion without a complete dependency audit and transaction-safe implementation.

### No real admin logout control

- Sidebar item labelled with a logout icon links to the public home page.
- It does not call the logout endpoint or clear the Supabase session.

Status: admin remains signed in after leaving the dashboard.

### No mobile/tablet admin navigation

- Admin sidebar is hidden below the `lg` breakpoint.
- No mobile menu replaces it.

Status: pages render, but navigation is unusable on smaller screens.

### Dependency vulnerabilities

`npm audit --omit=dev --audit-level=high` reported:

- 10 total vulnerabilities
- 1 critical
- 5 high
- Vulnerable dependency paths include `resend`/`@react-email/render`/`html-to-text`/`deepmerge`, plus `next` transitive packages and `sharp`.

Status: production dependency review/update required.

## Verified functioning

### Authentication and access

- Admin account exists in Supabase Auth.
- Admin password login succeeds.
- Portal access returns role `admin`.
- Anonymous `/admin` request redirects to admin login.
- Anonymous admin API request returns `401`.
- Hardcoded admin credential and override-cookie behavior are removed from application code.
- Deprecated `/api/admin/login` correctly returns `410`.

### Page rendering

Authenticated HTTP tests returned `200` without server-error markup for:

- Dashboard
- Courses
- Chapters with book/guidance filters
- Lessons with book/guidance filters
- Users
- EFT Payments
- Bank Settings
- Articles
- Threads
- Lesson Builder
- Media
- Quizzes
- Reflections
- Resources
- Content Flow

### Safe mutation tests

Verified against temporary data and cleaned afterward:

- Course/chapter/lesson content editor API persists changes.
- Lesson Builder saves a clean temporary lesson and creates 6 blocks.
- Resource metadata create/update works.
- Resource mutation rejects requests without a trusted origin.
- Thread topic create/delete works.
- Article draft create/edit works.
- Bank settings save works; original row restored.

### Build checks

- `npm.cmd run build`: passes.
- `npx.cmd tsc --noEmit`: passes after the build generated current route types.
- `npm.cmd run lint`: passes with warnings.
- Warnings include an unused variable and multiple raw `<img>` elements.

## Functional but not destructively exercised

These flows were inspected and their pages/APIs load, but live destructive actions were intentionally not performed on real records:

- Approve/reject/request-resubmission for the existing EFT payment.
- Approve/reject author applications and send decision email.
- Publish/reject/archive existing articles and send decision email.
- Delete real threads/comments.
- Ban/unban a real commenter email.
- Suspend, anonymize, or delete a real member.

The payment review RPC exists in the live database. These workflows still require a staging or dedicated test account/payment for full end-to-end verification.

## Partial or missing admin functionality

### Courses/books

- List: works.
- No filters: correct; courses are the books.
- Edit title/description/publish status: works through the shared editor.
- Create: broken by table-name casing.
- Delete/archive/reorder: missing.

### Chapters

- List/filter/detail: works.
- Edit/publish: shared endpoint and schema are compatible.
- Create/delete/archive/reorder: missing outside the course wizard.

### Lessons

- List/filter/detail: works.
- Edit/publish: verified.
- Create/delete/archive/reorder: missing outside the course wizard.

### Media

- Live list page works.
- Live DB currently has 0 mentor videos and 0 audio tracks.
- No upload/create/edit/delete controls.

### Quizzes

- Metrics/list page and book/guidance filters work.
- Live quiz tables currently contain 0 quiz, question, and response rows.
- No quiz/question creation or editing controls.

### Reflections

- Review/search/filter UI works for prompts and member journal/insight/mood records.
- Live prompt/response tables currently contain 0 prompt/response rows.
- No prompt creation/edit/delete workflow.

### Resources

- List and metadata editing work.
- Live DB has 10 resource rows.
- No upload/delete/publish lifecycle UI.

### Articles

- Draft create/edit works.
- Review APIs and UI exist.
- Live DB currently has 0 articles and 1 author application.
- Email-producing review actions need staging verification.

### Threads

- List/stats load.
- Topic create/delete verified.
- Ban and real-content deletion were not exercised.

### Payments

- Pending payment list and signed proof URL generation load.
- Bank settings save verified.
- Live DB has 1 payment request, 1 proof, and 2 entitlements.
- Payment approval RPC exists; real approval was not exercised.

### Users

- Directory/detail reads work.
- Edit/suspend/reactivate/anonymize/delete controls exist.
- Suspension enforcement is missing.
- Deletion dependency coverage is incomplete.

### Journeys and legacy Modules

- Journeys are aliases/rewrites to Courses, not a separate model.
- Legacy Modules routes duplicate Chapters and remain in the codebase.
- Neither appears in the current sidebar.

## Live database summary

- Profiles: 7
- Books/courses: 3
- Course versions: 4
- Chapters: 28
- Lessons: 210
- Lesson blocks: 2,730
- Resources: 10
- Quizzes/questions/responses: 0 / 0 / 0
- Reflection prompts/responses: 0 / 0
- Mentor videos/audio tracks: 0 / 0
- Articles: 0
- Author applications: 1
- Thread entries/topics/votes: 4 / 5 / 5
- Payment requests/proofs/entitlements: 1 / 1 / 2

Relationship checks found 0 orphan course versions, chapters, or lessons. Guidance values are `christian` and `religious`. All 3 books are published.

## Hardcoded status

- No hardcoded admin login remains in application code.
- Book filter options load from the database.
- Guidance paths, content statuses, resource types, and navigation definitions remain fixed allowlists/configuration, which is appropriate.
- Course wizard still contains stale “demo”/placeholder wording; cosmetic, but should be removed before handoff.

## Required order before administrator handoff

1. Apply and verify the profile privilege/RLS migration.
2. Fix lowercase `chapters` usage in course creation.
3. Fix Lesson Builder round-trip mapping for existing block types.
4. Enforce suspended/blocked account status during login and protected requests.
5. Add real logout and mobile admin navigation.
6. Resolve or explicitly accept dependency security advisories.
7. Retest course creation, lesson round-trip editing, self-promotion denial, suspension, user deletion, and payment approval.

Until steps 1–4 pass, the dashboard should not be considered production-ready.
