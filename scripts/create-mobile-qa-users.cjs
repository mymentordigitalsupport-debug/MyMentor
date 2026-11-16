const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { createClient } = require("@supabase/supabase-js");

const root = path.resolve(__dirname, "..");
const output = path.join(root, "tests", ".mobile-qa-credentials.json");
if (fs.existsSync(output)) {
  console.log("QA credentials already exist. Reusing test accounts.");
  process.exit(0);
}

const values = Object.fromEntries(fs.readFileSync(path.join(root, ".env.local"), "utf8")
  .split(/\r?\n/)
  .filter((line) => /^[A-Z][A-Z0-9_]*=/.test(line))
  .map((line) => {
    const index = line.indexOf("=");
    return [line.slice(0, index), line.slice(index + 1).replace(/^['"]|['"]$/g, "")];
  }));
if (!values.NEXT_PUBLIC_SUPABASE_URL || !values.SUPABASE_SERVICE_ROLE_KEY) throw new Error("Supabase admin configuration missing");

const admin = createClient(values.NEXT_PUBLIC_SUPABASE_URL, values.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const createdIds = [];
const nonce = crypto.randomBytes(5).toString("hex");

async function createFixture(role) {
  const email = `mobile-qa-${role}-${nonce}@example.com`;
  const password = crypto.randomBytes(24).toString("base64url");
  const displayName = role === "author" ? "Mobile QA Author" : "Mobile QA Member";
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { display_name: displayName, full_name: displayName },
  });
  if (error || !data.user) throw new Error(`${role} creation failed: ${error?.message ?? "no user returned"}`);
  createdIds.push(data.user.id);
  const updates = { role: role === "author" ? "author" : "user", status: "active", display_name: displayName };
  if (role === "member") Object.assign(updates, { onboarding_completed: true, onboarding_completed_at: new Date().toISOString() });
  const { error: updateError } = await admin.from("profiles").update(updates).eq("user_id", data.user.id);
  if (updateError) throw new Error(`${role} profile update failed: ${updateError.message}`);
  const { data: profile, error: readError } = await admin.from("profiles")
    .select("user_id,role,status,onboarding_completed")
    .eq("user_id", data.user.id)
    .single();
  if (readError || profile?.role !== updates.role || profile?.status !== "active") {
    throw new Error(`${role} profile verification failed: ${readError?.message ?? "unexpected profile"}`);
  }
  return { email, password, userId: data.user.id };
}

(async () => {
  try {
    const member = await createFixture("member");
    const author = await createFixture("author");
    fs.mkdirSync(path.dirname(output), { recursive: true });
    fs.writeFileSync(output, JSON.stringify({ member, author }, null, 2), { mode: 0o600, flag: "wx" });
    console.log("Created and verified member and author QA accounts. Credentials saved in ignored tests/.mobile-qa-credentials.json.");
  } catch (error) {
    for (const id of createdIds) await admin.auth.admin.deleteUser(id);
    console.error(error.message);
    process.exitCode = 1;
  }
})();
