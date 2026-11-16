const fs = require("node:fs");
const path = require("node:path");
const { createHash } = require("node:crypto");
const { Resend } = require("resend");

const recipient = process.argv.find((argument) => argument.startsWith("--to="))?.slice(5);
const shouldSend = process.argv.includes("--send");
if (!recipient || !/^\S+@\S+\.\S+$/.test(recipient)) throw new Error("Pass a valid --to=email address.");
process.loadEnvFile(path.join(process.cwd(), ".env.local"));

const senderEmail = process.env.RESEND_FROM_EMAIL?.trim() ?? "";
if (!/^\S+@mymentor\.digital$/i.test(senderEmail)) throw new Error("Verified My Mentor sender is not configured.");
if (!process.env.RESEND_API_KEY) throw new Error("RESEND_API_KEY is not configured.");

const appDirectory = path.join(process.cwd(), "public", "assets", "emails");
const authDirectory = path.join(process.cwd(), "supabase", "email-templates");
const labels = {
  "mymentor-member-registration-welcome.html": "Welcome to My Mentor",
  "mymentor-author-application-received.html": "We received your author application",
  "mymentor-author-account-approved.html": "Your My Mentor author account is approved",
  "mymentor-author-application-declined.html": "Your author application was not approved",
  "mymentor-article-received-pending-review.html": "Your article was submitted for review",
  "mymentor-article-published.html": "Your article is live on My Mentor",
  "mymentor-article-declined.html": "Your article was not approved for publication",
  "mymentor-payment-request-created.html": "Your EFT reference and next steps",
  "mymentor-payment-proof-received.html": "Your EFT proof is awaiting review",
  "mymentor-payment-approved.html": "Your EFT is approved; course access is active",
  "mymentor-payment-needs-resubmission.html": "Action needed: submit new EFT proof",
  "mymentor-payment-rejected.html": "Your EFT request was not approved",
  "mymentor-payment-cancelled.html": "Your EFT request was cancelled",
  "mymentor-admin-notification.html": "My Mentor: EFT proof ready for review",
  "mymentor-thread-verification.html": "Your My Mentor verification code",
  "confirm-signup.html": "Confirm your My Mentor email",
  "reset-password.html": "Reset your My Mentor password",
};
const values = {
  first_name: "Alex", article_title: "Finding your next step",
  review_feedback: "Please add a few practical examples before resubmitting.",
  dashboard_url: "https://example.com/today",
  author_dashboard_url: "https://example.com/author",
  article_url: "https://example.com/articles/finding-your-next-step",
  author_article_url: "https://example.com/author/articles/sample-article",
  payment_product: "Full course", payment_amount: "R79.00",
  payment_reference: "MM-SAMPLE123",
  payment_note: "Please upload a clearer image showing the amount and reference.",
  payments_url: "https://example.com/payments",
  course_url: "https://example.com/course",
  notification_title: "EFT proof ready for review",
  notification_details: "Full course · R79.00 · MM-SAMPLE123",
  notification_url: "https://example.com/admin/payments",
  verification_code: "123456",
};

const files = [
  ...fs.readdirSync(appDirectory).filter((file) => file.endsWith(".html")).map((file) => ({ file, directory: appDirectory })),
  ...fs.readdirSync(authDirectory).filter((file) => file.endsWith(".html")).map((file) => ({ file, directory: authDirectory })),
];
if (files.length !== 17 || files.some(({ file }) => !labels[file])) throw new Error("Preview inventory does not match the 17 templates.");

const messages = files.map(({ file, directory }, index) => {
  let html = fs.readFileSync(path.join(directory, file), "utf8");
  html = html.replace(/\{\{([a-z_]+)\}\}/g, (_, key) => {
    if (!(key in values)) throw new Error(`Unknown placeholder ${key} in ${file}.`);
    return values[key];
  });
  html = html.replace(/\{\{ \.SiteURL \}\}/g, "https://example.com").replace(/\{\{ \.TokenHash \}\}/g, "SAMPLE-TOKEN-NOT-VALID");
  if (/\{\{.*?\}\}/.test(html)) throw new Error(`Unresolved placeholder in ${file}.`);
  if (/href="https:\/\/mymentor\.digital/i.test(html)) throw new Error(`Live link in ${file}.`);
  const banner = `<div style="background:#e9ead6;color:#173a2a;padding:12px 20px;text-align:center;font:700 12px Arial,sans-serif;letter-spacing:.06em">PREVIEW ONLY · Sample details and links</div>`;
  html = html.replace(/(<body\b[^>]*>)/i, `$1${banner}`);
  return {
    from: `My Mentor <${senderEmail}>`,
    to: [recipient],
    subject: `[Preview ${String(index + 1).padStart(2, "0")}/17] ${labels[file]}`,
    html,
    text: `Preview only. This is the ${file} template with sample details and example.com links.`,
  };
});

const digest = createHash("sha256").update(recipient.toLowerCase()).update(messages.map((message) => message.html).join("\n")).digest("hex").slice(0, 32);
const idempotencyKey = `mymentor-email-previews-${digest}`;

async function main() {
  if (!shouldSend) {
    console.log(`Ready: ${messages.length} sample emails to ${recipient}. Pass --send to deliver.`);
    return;
  }
  const result = await new Resend(process.env.RESEND_API_KEY).batch.send(messages, { idempotencyKey });
  if (result.error) throw new Error(`Resend rejected preview batch: ${result.error.message}`);
  const ids = result.data?.data?.map((item) => item.id) ?? [];
  if (ids.length !== messages.length) throw new Error(`Resend returned ${ids.length} IDs for ${messages.length} previews.`);
  console.log(`Accepted ${ids.length} preview emails for ${recipient}.`);
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; });
