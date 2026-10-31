const fs = require("node:fs");
const path = require("node:path");

const directory = path.join(process.cwd(), "public", "assets", "emails");
const values = {
  first_name: "Test",
  article_title: "Test article",
  review_feedback: "Test feedback",
  dashboard_url: "https://example.test/today",
  author_dashboard_url: "https://example.test/author",
  article_url: "https://example.test/articles/test-article",
};
const files = fs.readdirSync(directory).filter((file) => file.endsWith(".html"));

if (files.length !== 7) throw new Error(`Expected 7 email templates, found ${files.length}.`);

for (const file of files) {
  let html = fs.readFileSync(path.join(directory, file), "utf8");
  const unknown = [...html.matchAll(/\{\{([a-z_]+)\}\}/g)]
    .map((match) => match[1])
    .filter((key) => !(key in values));
  if (unknown.length) throw new Error(`${file} has unknown placeholders: ${unknown.join(", ")}`);
  html = html.replace(/\{\{([a-z_]+)\}\}/g, (_, key) => values[key]);
  if (/\{\{[a-z_]+\}\}/.test(html)) throw new Error(`${file} has unresolved placeholders.`);
  if (!/href="https?:\/\//.test(html)) throw new Error(`${file} has no valid absolute link.`);
}

console.log("7 transactional email templates rendered without unresolved placeholders.");
