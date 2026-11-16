const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { createClient } = require("@supabase/supabase-js");

const root = path.resolve(__dirname, "..");
const env = Object.fromEntries(fs.readFileSync(path.join(root, ".env.local"), "utf8")
  .split(/\r?\n/).filter((line) => /^[A-Z][A-Z0-9_]*=/.test(line))
  .map((line) => { const index = line.indexOf("="); return [line.slice(0, index), line.slice(index + 1).replace(/^['"]|['"]$/g, "")]; }));
const credentials = JSON.parse(fs.readFileSync(path.join(root, "tests", ".mobile-qa-credentials.json"), "utf8"));
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function checked(result, label) {
  if (result.error) throw new Error(`${label}: ${result.error.message}`);
  return result.data;
}

(async () => {
  const memberId = credentials.member.userId;
  const versions = checked(await admin.from("course_versions").select("id,course_id,guidance_path").eq("guidance_path", "religious"), "Course versions");
  if (!versions.length) throw new Error("No religious course version");
  for (const version of versions) {
    const existing = checked(await admin.from("course_entitlements").select("id").eq("user_id", memberId)
      .eq("course_version_id", version.id).eq("access_level", "full_course").eq("active", true).limit(1), "Existing entitlement");
    if (!existing.length) checked(await admin.from("course_entitlements").insert({
      user_id: memberId, course_version_id: version.id, chapter_id: null, access_level: "full_course", active: true,
    }), "QA entitlement");
  }
  const existingEntry = checked(await admin.from("journal_entries").select("id")
    .eq("user_id", memberId).eq("title", "Mobile QA reflection").limit(1), "Existing journal entry");
  let journalId = existingEntry[0]?.id;
  if (!journalId) {
    const inserted = checked(await admin.from("journal_entries").insert({
      user_id: memberId, title: "Mobile QA reflection", body: "A short journal entry for mobile visual review.",
      entry_text: "A short journal entry for mobile visual review.", mood: "hopeful", mood_label: "hopeful", is_private: true,
    }).select("id").single(), "QA journal entry");
    journalId = inserted.id;
  }
  credentials.journalId = journalId;
  if (!credentials.onboarding) {
    const email = `mobile-qa-onboarding-${crypto.randomBytes(5).toString("hex")}@example.com`;
    const password = crypto.randomBytes(24).toString("base64url");
    const created = checked(await admin.auth.admin.createUser({
      email, password, email_confirm: true, user_metadata: { display_name: "Mobile QA Onboarding" },
    }), "Onboarding QA member");
    const userId = created.user.id;
    checked(await admin.from("profiles").update({ role: "user", status: "active", display_name: "Mobile QA Onboarding", onboarding_completed: false })
      .eq("user_id", userId), "Onboarding profile");
    checked(await admin.from("course_entitlements").insert({
      user_id: userId, course_version_id: versions[0].id, chapter_id: null, access_level: "full_course", active: true,
    }), "Onboarding entitlement");
    credentials.onboarding = { email, password, userId };
  }
  const chapters = checked(await admin.from("chapters").select("id,course_version_id,sort_order")
    .eq("course_version_id", versions[0].id).eq("is_published", true).order("sort_order").limit(1), "QA chapter");
  const chapterId = chapters[0]?.id;
  const lessons = chapterId ? checked(await admin.from("lessons").select("id,sort_order")
    .eq("chapter_id", chapterId).eq("is_published", true).order("sort_order").limit(1), "QA lesson") : [];
  credentials.routes = {
    course: `/course/${versions[0].course_id}`,
    chapter: chapterId ? `/course/${versions[0].course_id}/${chapterId}` : null,
    lesson: lessons[0] ? `/course/${versions[0].course_id}/${chapterId}/${lessons[0].id}` : null,
    journal: `/journal/${journalId}`,
  };
  fs.writeFileSync(path.join(root, "tests", ".mobile-qa-credentials.json"), JSON.stringify(credentials, null, 2), { mode: 0o600 });
  console.log(`Prepared ${versions.length} course access fixture(s), journal entry, onboarding member, and nested route samples.`);
})().catch((error) => { console.error(error.message); process.exitCode = 1; });
