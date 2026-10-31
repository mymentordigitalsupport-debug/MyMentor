# Security Hardening Plan

## Scope and limit

This plan reviews the checked-in Next.js application, Supabase migrations, API routes, and deployment files. It does **not** prove the live Supabase project or Vercel account settings: run the live checks in Phase 0 before declaring the application secure.

No internet-facing application can promise that it is impossible to breach. The target is layered protection: a stolen browser key, a bypassed route check, or a compromised client must not expose member data.

## Current risk summary

| Priority | Finding | Evidence | Required outcome |
| --- | --- | --- | --- |
| P0 | Members can likely promote themselves by updating `profiles.role`. | [phase1 schema](/D:/Project%20Builds/MyMentor/supabase/migrations/20260529000001_phase1_schema.sql) grants profile owners a broad `FOR UPDATE` policy. `role` is an editable table column and app/API authorization trusts it. | Only a privileged server workflow can change roles. |
| P0 | Several public-schema tables have read policies but no visible `ENABLE ROW LEVEL SECURITY` in the base migration. Policies do nothing until RLS is enabled. | Same migration enables RLS only for member-owned tables, then defines policies for courses, lessons, media metadata, and resources. | Enable RLS and replace default grants on **every** exposed table. |
| P0 | Public article media makes every uploaded object publicly addressable, including drafts or uploads never attached to a published article. | [article storage migration](/D:/Project%20Builds/MyMentor/supabase/migrations/20261023040000_create_articles_media_storage_bucket.sql) creates `articles_media` as public. | Private bucket, signed URLs, or a vetted publish-copy flow. |
| P0 | Author signup creates confirmed password accounts with a service-role route and lacks durable abuse controls. | [author registration route](/D:/Project%20Builds/MyMentor/src/app/api/authors/register/route.ts) calls `auth.admin.createUser({ email_confirm: true })`. | Verify email before activation; rate-limit and add bot protection. |
| P0 | The mentor route transmits account context, including goals and latest mood, to an external AI endpoint by default. | [mentor chat route](/D:/Project%20Builds/MyMentor/src/app/api/mentor-chat/route.ts), [mentor client](/D:/Project%20Builds/MyMentor/src/lib/mentor-ai.ts). | Explicit consent, data minimization, vendor review, and a private authenticated inference endpoint. |
| P1 | Authorization is based on a mutable `profiles.role` value in middleware and API guards. | [middleware](/D:/Project%20Builds/MyMentor/src/middleware.ts), [admin guard](/D:/Project%20Builds/MyMentor/src/lib/admin/guards.ts). | Immutable application claims or a protected role table/function; server-side authorization on every privileged route. |
| P1 | API abuse protection is incomplete. The chat rate limiter is process-local; signup, email, article upload, and admin-sensitive routes have no consistent origin/rate controls. | [mentor rate limiter](/D:/Project%20Builds/MyMentor/src/lib/mentor-ai.ts), API route inventory under `src/app/api`. | Shared rate limiting, request limits, Origin checks, monitoring, and bot controls. |
| P1 | Browser-facing security headers are absent from `next.config.ts` and middleware. | [next config](/D:/Project%20Builds/MyMentor/next.config.ts). | CSP, frame protection, MIME sniffing protection, Referrer-Policy, Permissions-Policy, HSTS at hosting edge. |
| P1 | Security-definer functions require a live audit of ownership, privileges, and search path. | `handle_new_user`, article role helper, email-claim helper, and thread functions in migrations. | Least privilege, fixed search path, explicit execute revoke/grant, tests. |
| P2 | Dependency audit could not complete in this environment because the local certificate chain rejected npm's advisory endpoint. | `npm audit --omit=dev --json` failed with `unable to verify the first certificate`. | Restore trusted CA, run audit in CI, patch findings under a release gate. |

## Phase 0 — contain and verify live state

Complete before adding feature work.

1. Rotate the Supabase service-role key, Resend key, cron secret, and AI vendor credentials if they have ever been placed in a browser, repository, screenshot, chat, or build log. Keep only `.env.example` tracked. Confirm `.env.local` is ignored and use Vercel/Supabase secret stores for production.
2. In Supabase Dashboard, run Database Advisors and review every warning. Export an inventory of all `public` tables, RLS state, policies, grants, functions, storage buckets, and extensions. Compare it to the migrations; migrations alone cannot prove production state.
3. Confirm Data API exposed schemas are limited to `public` only when required. Revoke default table privileges and grant only the exact operations each `anon` or `authenticated` client needs.
4. Review Supabase Auth: enforce email confirmation, configure approved redirect URLs, disable unused providers, set a short JWT lifetime, enable leaked-password protection and MFA for admins, and configure a real SMTP provider with domain authentication.
5. Review Vercel: production-only environment variables, team MFA, least-privilege project access, deployment protection for previews, access logs, WAF/rate rules, and a verified custom domain.

**Gate:** record the exported inventory, advisor results, and secret-rotation date in a private operations log.

## Phase 1 — repair authorization and database isolation

Create a dedicated migration and `supabase/tests/` policy tests. Do not edit applied migrations.

### 1. Lock down roles and profiles

1. Remove direct member `UPDATE` access to sensitive profile columns: `role`, `status`, `user_id`, identity flags, and any admin workflow fields.
2. Expose a narrowly scoped RPC or server route for permitted member fields only: display name, anonymous name, goal, preference, and onboarding fields. Validate each value and use `SECURITY INVOKER` where possible.
3. Move administrative roles to `app_metadata` through the service-role API, or maintain roles in a dedicated table that members cannot update. Never authorize from `user_metadata`.
4. Require fresh server-side user validation and protected role lookup in every admin/author route; middleware redirects remain user experience only, never the authorization boundary.
5. Add audit records for role changes, account status changes, admin actions, export attempts, and account deletion. Store actor, target, action, timestamp, request ID, and safe metadata; never store passwords, raw access tokens, or journal text.

### 2. Apply RLS and grants to every exposed table

1. Enumerate every `public` table, including courses, course versions, chapters/modules, lessons, blocks, media metadata, prompts, quizzes, resources, articles, threads, chatbot history, transactional email events, and profiles.
2. For each table: `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`; revoke default `anon` and `authenticated` grants; grant only needed verbs; create one policy per allowed operation.
3. Public content policies must require both published parent records and published child records. Do not use broad `USING (true)` for draft-capable or member data.
4. Member-owned rows must use both `USING ((select auth.uid()) = user_id)` and `WITH CHECK ((select auth.uid()) = user_id)` on updates/inserts. Test cross-user reads, writes, deletes, and ID reassignment attempts.
5. Limit public Threads read access deliberately. If it remains public, never include email, profile identifiers, unpublished attachment paths, or private reactions in rows returned to `anon`.
6. Keep `transactional_email_events` service-role-only. Confirm it has no client grants or select policy.

### 3. Function and storage hardening

1. For every `SECURITY DEFINER` function: set a fixed safe `search_path`, qualify referenced objects, verify owner, revoke `PUBLIC` execute, and grant only intended roles. Prefer `SECURITY INVOKER` where it works.
2. Replace the public `articles_media` bucket. Preferred design: private source bucket; server checks article authorization; published images are copied to a separate public bucket only on publish, then removed on unpublish/delete. Alternative: signed URLs issued only after access checks.
3. For `threads_media`, allow signed-in read only if that is the policy. Add MIME magic-byte checks and server-side transcoding/virus scanning before serving user uploads. File extensions and browser MIME claims are not sufficient.
4. Add storage quotas per user, upload rate limits, maximum dimensions/duration, and cleanup for orphaned uploads.

**Gate:** policy tests cover allow/deny cases for anon, anonymous-authenticated, member A, member B, author, and admin. Run `supabase test db` and Database Advisors cleanly.

## Phase 2 — secure API routes and abuse paths

### Shared server controls

1. Create an API security wrapper: request ID, structured safe logging, JSON/content-type validation, body-size limits, schema validation (Zod/Valibot), consistent 401/403/429 responses, and an Origin/Host allowlist for cookie-authenticated mutations.
2. Use a shared durable rate limiter (Upstash/Redis/Vercel WAF or equivalent), keyed by route, user ID, IP, and abuse class. Do not rely on in-memory `Map` state on serverless instances.
3. Apply strict limits to login, registration, password reset, email checks, author application, chat, uploads, and every admin mutation. Return generic responses for account existence checks to avoid enumeration.
4. Add a human-verification challenge to anonymous posting and author registration after a small threshold; use WAF rules for bot traffic and abusive upload requests.
5. Validate `next`/redirect parameters against an internal-path allowlist. Never concatenate untrusted redirect strings into response URLs.
6. Use idempotency keys for destructive or external-effect operations: account deletion, role changes, email dispatch, publishes, and uploads.

### Route-specific work

| Route group | Required change |
| --- | --- |
| `/api/authors/register` | Do not call `email_confirm: true`; send verification; generic duplicate response; durable IP/email rate limit; CAPTCHA; no password in logs. |
| `/api/auth/check-email` | Remove public account enumeration, or return the same response and strongly throttle. |
| `/api/auth/member-welcome` | Ensure only a newly verified account can queue the message; make it idempotent and rate limited. |
| `/api/auth/delete-account` | Require recent reauthentication/MFA, CSRF/Origin validation, a cooldown, session revocation before deletion, audit event, and confirmation flow. |
| `/api/admin/*` | Centralize `requireAdmin`; validate body schemas; add reauthentication for delete/suspend/role changes; audit every mutation. |
| `/api/author/*` and article uploads | Validate schema; use private uploads; scan/transcode files; author/admin check before every object action; rate/size/quota limits. |
| `/api/mentor-chat` | Shared rate limiting; reduce payload retention; prevent prompt injection from retrieved content; restrict third-party payload; add abuse reporting and safe logging. |
| `/api/internal/email-retry` | Keep secret header but replace static secret where available with Vercel Cron verification; rate limit; log each run safely. |

## Phase 3 — protect member data and AI interactions

1. Classify data: identity/contact, journal/reflection, mood/wellbeing, learning progress, Threads content, admin records, and telemetry. Treat journal, mood, goals, and chat as sensitive member data.
2. Write retention periods and deletion behavior. Define what is deleted, anonymized, retained for legal/security reasons, and removed from backups after account deletion.
3. Change chat context to opt-in fields only. Do not transmit journal text, mood, goals, email, or account identity to a third-party model unless the member explicitly enables it and the vendor has an appropriate data-processing agreement.
4. Route AI through a vendor endpoint with authentication, request signing, regional/data-retention controls, output logging disabled by default, and a narrow response contract. Redact identifiers before sending.
5. Add consent records, privacy request workflow, export/delete workflow, incident notification procedure, and support runbook.

## Phase 4 — browser, deployment, and supply-chain defenses

1. Add security headers: strict CSP using per-request nonces or SRI where compatible, `frame-ancestors 'none'`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, restrictive `Permissions-Policy`, and HSTS at the HTTPS edge. Test analytics, Supabase, image storage, fonts, and email flows after rollout.
2. Set cookie security attributes through Supabase SSR: `Secure`, `HttpOnly` where applicable, `SameSite=Lax` or stricter, narrow path/domain, and expiry appropriate to risk.
3. Add dependency controls: lockfile review, `npm audit --omit=dev` in CI after fixing local CA trust, Dependabot/Renovate, SBOM generation, and a policy for critical CVEs.
4. Pin third-party assets, minimize remote images/scripts, and avoid rendering untrusted markdown as HTML. Sanitize any future rich text with a proven allowlist.
5. Protect production: MFA, least privilege, branch protection, mandatory code review for migrations/auth, secret scanning, build provenance, preview access restrictions, and scheduled backup/restore tests.

## Phase 5 — monitoring and attack verification

1. Add alerts for authentication failures, signup spikes, rate-limit blocks, role changes, service-role API errors, RLS denials, unusual storage reads/writes, failed deletion attempts, and email retries.
2. Centralize logs with redaction. Never log bearer tokens, cookies, passwords, journal body, mood notes, full email content, or model prompts containing private context.
3. Add automated tests:
   - RLS allow/deny tests for every table and storage bucket.
   - Route tests for unauthenticated, member, anonymous-authenticated, author, and admin callers.
   - CSRF/Origin, open redirect, IDOR, upload content-type, quota, and rate-limit tests.
   - Regression tests that prove a member cannot change their role or access another member's journal/chat/profile.
4. Before launch, commission an independent authenticated penetration test. Scope the web app, Supabase Data API, auth flows, storage, admin APIs, and AI proxy. Retest all findings after fixes.

## Recommended implementation order

1. P0 profile-role and RLS/grant corrections.
2. Remove public unpublished media exposure and lock down storage.
3. Secure author signup, account deletion, and account-enumeration routes.
4. Deploy shared rate limiting, input validation, CSRF/Origin checks, and WAF rules.
5. Add AI privacy controls and consent.
6. Add headers, CI dependency gates, audits, monitoring, and penetration testing.

## Acceptance criteria

- A browser client with the anon key cannot read, insert, update, or delete any row beyond the explicitly intended public data.
- Member A cannot view or modify Member B's profile, journal, mood, progress, chat, attachment, or draft content.
- A member cannot set `role`, `status`, `user_id`, or administrative profile fields.
- Anonymous Auth users are intentionally permitted only where explicitly tested.
- Every sensitive endpoint has server-side authorization, schema validation, durable rate limiting, and safe audit logging.
- Secrets are absent from Git and browser bundles; production secrets have been rotated and least-privilege scoped.
- A restore exercise, RLS test suite, CI security checks, and third-party penetration test have passed.

## References

- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security): RLS must be paired with deliberate grants and tested per operation.
- [Next.js Content Security Policy guide](https://nextjs.org/docs/app/guides/content-security-policy): CSP protects against XSS, clickjacking, and code injection; strict nonce CSP has dynamic-rendering tradeoffs.
