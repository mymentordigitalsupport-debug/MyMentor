const fs = require("node:fs");
const path = require("node:path");

const directory = path.join(process.cwd(), "public", "assets", "emails");
const authDirectory = path.join(process.cwd(), "supabase", "email-templates");
const values = {
  first_name: "Test", article_title: "Test article", review_feedback: "Test feedback",
  dashboard_url: "https://example.test/today", author_dashboard_url: "https://example.test/author",
  article_url: "https://example.test/articles/test-article", payment_product: "Full course",
  author_article_url: "https://example.test/author/articles/test-article-id",
  payment_amount: "R79.00", payment_reference: "MM-TEST123", payment_note: "Please upload a clearer image.",
  payments_url: "https://example.test/payments", course_url: "https://example.test/course",
  notification_title: "New EFT request", notification_details: "A member requested EFT payment.",
  notification_url: "https://example.test/admin/payments", verification_code: "123456",
};

const files = fs.readdirSync(directory).filter((file) => file.endsWith(".html"));
if (files.length !== 15) throw new Error(`Expected 15 app email templates, found ${files.length}.`);
for (const file of files) {
  let html = fs.readFileSync(path.join(directory, file), "utf8");
  const unknown = [...html.matchAll(/\{\{([a-z_]+)\}\}/g)].map((match) => match[1]).filter((key) => !(key in values));
  if (unknown.length) throw new Error(`${file} has unknown placeholders: ${unknown.join(", ")}`);
  html = html.replace(/\{\{([a-z_]+)\}\}/g, (_, key) => values[key]);
  if (/\{\{[a-z_]+\}\}/.test(html)) throw new Error(`${file} has unresolved placeholders.`);
  const noActionFiles = new Set(["mymentor-thread-verification.html", "mymentor-author-application-received.html", "mymentor-author-application-declined.html"]);
  if (!noActionFiles.has(file) && !/href="https:\/\//.test(html)) throw new Error(`${file} has no valid absolute link.`);
  if (noActionFiles.has(file) && /href=/.test(html)) throw new Error(`${file} links to an unavailable action.`);
  if (!html.includes("My Mentor") || !html.includes("#173a2a") || !html.includes("#f6f3e9")) throw new Error(`${file} lacks the shared brand shell.`);
  if (file.startsWith("mymentor-payment-") && !html.includes("MM-TEST123")) throw new Error(`${file} lacks the payment reference.`);
  const requiredCopy = {
    "mymentor-author-application-received.html": ["awaiting review", "cannot access the author dashboard"],
    "mymentor-author-application-declined.html": ["cannot approve", "Test feedback", "hello@mymentor.digital"],
    "mymentor-article-received-pending-review.html": ["not published yet"],
    "mymentor-article-declined.html": ["did not approve", "submit it again", "https://example.test/author/articles/test-article-id"],
    "mymentor-payment-request-created.html": ["not a payment confirmation", "R79.00", "Send proof for review"],
    "mymentor-payment-proof-received.html": ["does not approve the payment"],
    "mymentor-payment-approved.html": ["now active"],
    "mymentor-payment-needs-resubmission.html": ["Please upload a clearer image.", "Send proof for review"],
    "mymentor-payment-rejected.html": ["Please upload a clearer image.", "hello@mymentor.digital"],
    "mymentor-payment-cancelled.html": ["hello@mymentor.digital"],
  };
  for (const phrase of requiredCopy[file] ?? []) if (!html.includes(phrase)) throw new Error(`${file} lacks expected copy: ${phrase}`);
}

const authFiles = fs.readdirSync(authDirectory).filter((file) => file.endsWith(".html"));
if (authFiles.length !== 2) throw new Error(`Expected 2 Auth templates, found ${authFiles.length}.`);
for (const file of authFiles) {
  const html = fs.readFileSync(path.join(authDirectory, file), "utf8");
  if (file === "confirm-signup.html" && !html.includes('token_hash={{ .TokenHash }}&amp;type=email')) throw new Error(`${file} lacks the signup confirmation link.`);
  if (file === "reset-password.html" && !html.includes('token_hash={{ .TokenHash }}&amp;type=recovery')) throw new Error(`${file} lacks the recovery token link.`);
  if (!html.includes("#173a2a") || !html.includes("#f6f3e9")) throw new Error(`${file} lacks the shared brand shell.`);
}
console.log("15 app and 2 Supabase Auth email templates validated.");
