# Admin Dashboard Implementation Plan

Date: 2026-11-14

## Goal

Finish the admin dashboard so administrators can manage all learning content safely, filter it by book and guidance path, save lesson content, publish content, and manage the full content lifecycle.

## Principles

- Reuse the existing database hierarchy wherever possible.
- Do not create a separate `books` table unless live schema inspection proves that books must exist independently from courses.
- Use `courses` as the current book records.
- Use `course_versions.guidance_path` as the source of truth for Religious and Christian content.
- Keep filters consistent across every content screen.
- Make filters URL-driven and bookmarkable.
- Do not remove or rename existing data until migration impact is verified.
- Every mutation must validate admin access server-side.

## Phase 0: Confirm the live database

Before writing SQL:

1. Inspect live tables, columns, constraints, indexes, foreign keys, RLS policies, and migration history.
2. Compare the live schema against `supabase/migrations`.
3. Identify schema drift, especially around:
   - `profiles`
   - `courses`
   - `course_versions`
   - `chapters`
   - `lessons`
   - `lesson_content_blocks`
   - `mentor_videos`
   - `audio_tracks`
   - `resources`
   - `article_articles`
4. Check real course rows and confirm the three book records:
   - Uprooting Drug Abuse
   - From Addicts to Leaders
   - Protecting the Next Generation
5. Check all existing `guidance_path` values and identify invalid or null values.
6. Check whether media, resources, and articles currently have reliable links to courses or lessons.
7. Run Supabase security, performance, and health advisors.

Completed through `.env.local` with read-only queries on 2026-11-14.

Verified:

- The three books already exist as `courses` rows.
- `course_versions.guidance_path` already supports Religious/Christian filtering.
- Chapters, lessons, and lesson blocks already inherit book and guidance through foreign keys.
- Standalone resources have no course/version relationship.
- Media tables are empty and have no course/version relationship.
- Quiz and reflection tables are empty in the live database.
- `course_versions.sort_order` does not exist and must not be queried.

No SQL migration has been created or executed.

## Phase 1: Define the content model

### Existing model to keep

```text
courses                    = books
  course_versions          = Religious/Christian variants
    chapters
      lessons
        lesson_content_blocks
```

### Decisions

- Filter books by `courses.id` or stable `courses.slug`.
- Filter guidance by `course_versions.guidance_path`.
- Derive chapter and lesson filters through their parent course version.
- Derive quiz and reflection filters through their lesson relationship.
- Do not duplicate book or guidance values on every child row unless query performance or standalone records require it.

### Conditional schema changes

Only add migrations where needed after Phase 0:

- Add `book_key` or `book_order` to `courses` if slug is not a safe stable identifier.
- Resources, Media, and Articles are outside the requested book/guidance filter scope.

No new `books` table.

No migration is currently required for the requested filters.

Do not add columns to Resources, Media, or Articles for this filter system unless their scope changes later.

Do not add columns to empty quiz/reflection tables solely for filtering; their lesson relationships already provide the inheritance path.

## Phase 2: Standardize filter infrastructure

1. Create shared filter types:
   - `bookId` or `bookSlug`
   - `guidancePath`
2. Create a shared admin filter component.
3. Use URL search parameters:
   - `?book=uprooting-drug-abuse`
   - `?guidance=religious`
4. Add an “All books” and “All guidance” option.
5. Preserve query parameters when opening a detail page and returning to a list.
6. Show filtered record counts.
7. Show clear empty states when a filter combination has no records.
8. Load filter options from the database, not hardcoded arrays, except for the fixed guidance enum if confirmed.

## Phase 3: Apply filters to content screens

Implement in this order:

1. Chapters
2. Lessons
3. Lesson Builder
4. Quizzes
5. Reflections
6. Content Flow overview

Each page must:

- Read filters from the URL.
- Query only matching records.
- Display book and guidance labels.
- Pass the active filter context into create/edit screens.
- Avoid loading all records and filtering only in the browser for large datasets.

## Phase 4: Fix admin authentication

1. Remove hardcoded credentials from production behavior.
2. Use Supabase Auth for admin login.
3. Use `profiles.role` and/or trusted `app_metadata` for authorization.
4. Make every admin API route use the same `requireAdminSession` guard.
5. Remove the override-cookie bypass.
6. Ensure actor IDs are recorded in admin mutations and review logs.
7. Test unauthenticated, normal-user, author, and admin access separately.

## Phase 5: Finish course/book management

Add server-side actions and UI for:

- Edit course/book title, slug, description, cover, and ordering.
- Edit guidance versions.
- Publish/unpublish course and versions.
- Archive or safely delete content.
- Reorder chapters and lessons.
- Validate that every version has a valid guidance path.
- Create new books through the existing course model.

Course creation must become atomic. Preferred implementation:

1. Validate the entire payload first.
2. Use a database function or transaction-safe server operation.
3. Create course, versions, chapters, and lesson shells together.
4. Roll back everything if any insert fails.
5. Return a clear error to the admin.

## Phase 6: Finish Lesson Builder

1. Define the persisted block mapping for each builder section.
2. Load existing blocks into the editor.
3. Add a save-draft API.
4. Upsert lesson content blocks in one transaction.
5. Add publish/unpublish API actions.
6. Validate required content before publishing.
7. Add optimistic or explicit save feedback.
8. Prevent accidental loss of unsaved edits.
9. Keep preview based on the same persisted content model used by members.
10. Test every section:
    - Welcome
    - Teaching
    - Video
    - Reflection
    - Daily Action
    - Encouragement

## Phase 7: Add CRUD to supporting content

### Media

- Upload media.
- Edit title and metadata.
- Attach media to lessons.
- Replace or remove media.

### Quizzes

- Create and edit quiz questions.
- Edit options and correct answers.
- Reorder questions.
- Preview quiz behavior.
- Publish with the lesson.

### Reflections

- Edit reflection prompts.
- Associate prompts with lessons.
- View member responses using book/guidance filters.
- Preserve member privacy and admin authorization.

### Resources

- Create, edit, publish, unpublish, archive, and delete resources.
- Support storage files and database records without duplicate listings.

### Articles

- Keep the editorial queue separate from the book/guidance filter system.

## Phase 8: Remove incomplete and duplicate flows

- Remove the demo auto-fill action from production.
- Remove `placehold.co` cover defaults.
- Remove demo fallback copy from persisted editor behavior.
- Replace Journeys-as-Courses with a clear supported model, or remove the duplicate route.
- Remove or redirect legacy Modules routes after confirming no active links depend on them.
- Replace misleading read-only detail screens with real editors or clearly label them as inspection-only.

## Phase 9: Security and data validation

1. Validate all admin mutations on the server.
2. Use allowlists for guidance paths and content status values.
3. Validate foreign keys belong to the selected parent.
4. Add RLS policies for any client-accessible tables.
5. Keep service-role access server-only.
6. Record audit actor and timestamps for publish, delete, archive, and approval actions.
7. Protect member reflections and personal data.
8. Run Supabase advisors after migrations.

## Phase 10: Testing

### Database

- Migration applies to a clean database.
- Migration applies safely to the current database.
- Existing course/version relationships remain valid.
- Existing member progress and entitlements remain valid.
- RLS policies behave correctly.
- Indexes are used for filtered queries.

### Admin UI

- Courses page lists the books directly and has no content filters.
- All child content filters correctly by book and guidance path.
- Religious and Christian filters work independently and together with book filters.
- Filter state survives refresh and navigation.
- Empty states are correct.
- Create/edit/publish actions persist after refresh.
- Failed mutations do not leave partial records.

### Access control

- Logged-out users cannot access admin pages or APIs.
- Normal members cannot access admin pages or APIs.
- Authors cannot access unrelated admin controls.
- Admin actions record the correct actor.

### Build checks

- `npx.cmd tsc --noEmit`
- `npm.cmd run build`
- Relevant integration tests
- Manual smoke test of every admin route

## Completion definition

The admin dashboard is complete when:

- All filterable learning-content screens support the correct book and guidance filters; Courses/books remain unfiltered.
- Content filters query the database rather than only filtering browser-loaded data.
- Courses/books, chapters, lessons, quizzes, reflections, media, and resources have clear supported lifecycle actions.
- Lesson Builder saves drafts and publishes successfully.
- Admin authentication is real and consistent across pages and APIs.
- No demo credentials, demo autofill, placeholder production content, or misleading inactive buttons remain.
- Existing member access, payments, progress, and content delivery continue working.
- Database migrations, RLS, advisors, TypeScript, build, and smoke tests pass.
