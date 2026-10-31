# My Mentor — Phase 1

> *We Transform Together*

A premium mobile-first guided transformation, recovery, and coaching platform.

---

## Running Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
RESEND_API_KEY=your_resend_key          # optional in Phase 1
RESEND_FROM_EMAIL=hello@mymentor.app    # optional in Phase 1
```

---

## Supabase Setup (Manual Steps)

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. In the SQL Editor, run **in order**:
   - `supabase/migrations/001_phase1_schema.sql`
   - `supabase/migrations/002_seed_demo_content.sql`
3. Copy your project URL and anon key into `.env.local`
4. To make yourself an admin, run in the SQL Editor:
   ```sql
   UPDATE profiles SET role = 'admin' WHERE user_id = 'your-auth-user-id';
   ```

---

## Routes Created

| Route | Description |
|---|---|
| `/` | Landing page / hero |
| `/login` | Sign in |
| `/register` | Create account (supports `?mode=anonymous`) |
| `/onboarding` | 6-step onboarding flow |
| `/today` | Today dashboard |
| `/course` | Course overview |
| `/course/[courseId]` | Course detail + Chapters |
| `/course/[courseId]/[ChapterId]` | Chapter detail + lessons |
| `/course/[courseId]/[ChapterId]/[lessonId]` | Lesson player |
| `/journal` | Journal list |
| `/journal/new` | New journal entry |
| `/journal/[entryId]` | Journal entry detail |
| `/progress` | Progress screen |
| `/resources` | Resources library |
| `/admin` | Admin dashboard |
| `/admin/courses` | Manage courses |
| `/admin/chapters` | Manage Chapters |
| `/admin/lessons` | Manage lessons |
| `/admin/media` | Manage videos/audio |
| `/admin/quizzes` | Manage quizzes |
| `/admin/reflections` | Manage reflection prompts |
| `/admin/resources` | Manage resources |

---

## Files Created / Changed

**New files:**
- `src/middleware.ts` — session refresh + route protection
- `src/types/index.ts` — all shared TypeScript types
- `src/lib/utils.ts` — cn, formatDate, getGreeting, percent, etc.
- `src/hooks/useProfile.ts` — client-side profile hook
- `src/components/ui/` — Button, Card, Input, Textarea, Badge, ProgressBar, MoodPill, PageTransition
- `src/components/layout/` — BottomNav, AdminSidebar
- `src/components/landing/HeroSection.tsx`
- `src/components/auth/` — LoginForm, RegisterForm
- `src/components/onboarding/` — OnboardingShell + 6 step components
- `src/components/today/` — GreetingHeader, TodayLessonCard, MoodCheckIn, ProgressSummary, MentorMessage
- `src/components/journey/` — CourseCard, ChapterCard, LessonRow
- `src/components/lesson/` — LessonBlock, LessonCompleteCard + 10 block components
- `src/components/journal/` — JournalEntryCard, JournalEditor
- `src/components/resources/ResourceCard.tsx`
- All app pages (today, journey, journal, progress, resources)
- All admin pages (dashboard, journeys, Chapters, lessons, media, quizzes, reflections, resources)
- `supabase/migrations/001_phase1_schema.sql`
- `supabase/migrations/002_seed_demo_content.sql`

**Modified:**
- `src/app/layout.tsx` — improved metadata
- `src/app/page.tsx` — landing page

---

## Known Limitations (Phase 1)

- No real video/audio — all media is placeholder UI
- Admin CMS is read-only (no create/edit forms yet — data managed via SQL)
- No email sending (Resend wired but not triggered)
- Admin role must be set manually in the database
- No password reset flow yet
- No image uploads (Supabase Storage not wired yet)

---

## Recommended Next Steps

1. Add create/edit forms to Admin CMS (CourseForm, ChapterForm, LessonForm, ContentBlockForm)
2. Wire Supabase Storage for video/audio/image uploads
3. Add password reset flow
4. Add admin invite flow (set role via email)
5. Add Framer Motion page transitions between app routes
6. Add streak tracking logic
7. Add push notification support (PWA)
8. Add Resend email for onboarding welcome
