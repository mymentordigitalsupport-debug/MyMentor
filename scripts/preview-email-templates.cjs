const fs = require("node:fs");
const path = require("node:path");

const source = path.join(process.cwd(), "public", "assets", "emails");
const target = path.join(process.cwd(), "artifacts", "email-previews");
const values = {
  first_name: "Alex", article_title: "Finding your next step", review_feedback: "Please add a few practical examples before resubmitting.",
  dashboard_url: "https://mymentor.digital/today", author_dashboard_url: "https://mymentor.digital/author",
  article_url: "https://mymentor.digital/articles/finding-your-next-step", payment_product: "Full course",
  author_article_url: "https://mymentor.digital/author/articles/example-article-id",
  payment_amount: "R79.00", payment_reference: "MM-8AB123CDEF", payment_note: "Please upload a clearer image showing the amount and reference.",
  payments_url: "https://mymentor.digital/payments", course_url: "https://mymentor.digital/course",
  notification_title: "EFT proof ready for review", notification_details: "Full course · R79.00 · MM-8AB123CDEF",
  notification_url: "https://mymentor.digital/admin/payments", verification_code: "123456",
};
fs.mkdirSync(target, { recursive: true });
for (const file of fs.readdirSync(source).filter((name) => name.endsWith(".html"))) {
  const html = fs.readFileSync(path.join(source, file), "utf8").replace(/\{\{([a-z_]+)\}\}/g, (_, key) => values[key] ?? "");
  fs.writeFileSync(path.join(target, file), html);
}
console.log(`Preview files: ${target}`);
