const fs = require("node:fs");
const path = require("node:path");

const output = path.join(process.cwd(), "public", "assets", "emails");

function escape(value) {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
}

function email({ preview, label, title, paragraphs, facts = [], button, url, note }) {
  const factRows = facts.map(([key, value]) => `<tr><td style="padding:9px 16px 9px 0;color:#627266;font-size:13px;vertical-align:top;white-space:nowrap">${escape(key)}</td><td style="padding:9px 0;color:#203b2e;font-size:14px;font-weight:600;line-height:1.5;overflow-wrap:anywhere">${value}</td></tr>`).join("");
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${escape(title)}</title>
<style>@media(max-width:620px){.shell{width:100%!important}.pad{padding-left:24px!important;padding-right:24px!important}.title{font-size:29px!important;line-height:1.2!important}}</style></head>
<body style="margin:0;padding:0;background:#f6f3e9;color:#203b2e;font-family:Arial,Helvetica,sans-serif;-webkit-text-size-adjust:100%">
<div style="display:none!important;max-height:0;overflow:hidden;opacity:0;color:transparent">${escape(preview)}</div>
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f6f3e9"><tr><td align="center" style="padding:28px 12px 36px">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" class="shell" style="width:100%;max-width:600px;background:#fffdf7;border:1px solid #dce2d6;border-radius:14px;overflow:hidden">
<tr><td class="pad" style="padding:22px 40px;background:#173a2a;color:#fffdf7;font-family:Georgia,serif;font-size:21px;letter-spacing:.01em">My Mentor</td></tr>
<tr><td class="pad" style="padding:34px 40px 30px">
<p style="margin:0 0 12px;color:#65806b;font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase">${escape(label)}</p>
<h1 class="title" style="margin:0 0 20px;color:#173a2a;font-family:Georgia,serif;font-size:33px;font-weight:400;line-height:1.2">${escape(title)}</h1>
${paragraphs.map((p) => `<p style="margin:0 0 16px;font-size:15px;line-height:1.65">${p}</p>`).join("\n")}
${facts.length ? `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:20px 0 24px;border-top:1px solid #e4e9df;border-bottom:1px solid #e4e9df">${factRows}</table>` : ""}
${button ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0"><tr><td style="background:#173a2a;border-radius:7px"><a href="${url}" style="display:inline-block;padding:13px 20px;color:#fffdf7;font-size:14px;font-weight:700;text-decoration:none">${escape(button)}</a></td></tr></table>` : ""}
${note ? `<p style="margin:20px 0 0;color:#627266;font-size:13px;line-height:1.6">${note}</p>` : ""}
</td></tr><tr><td class="pad" style="padding:19px 40px;border-top:1px solid #e4e9df;color:#66776a;font-size:12px;line-height:1.5">My Mentor · Practical support, one step at a time.</td></tr></table>
</td></tr></table></body></html>\n`;
}

const messages = {
  "mymentor-member-registration-welcome.html": { preview: "Your My Mentor account is ready.", label: "Welcome", title: "Welcome to My Mentor", paragraphs: ["Hi {{first_name}}, your account is ready.", "Open your dashboard for today’s check-in and your next steps."], button: "Open your dashboard", url: "{{dashboard_url}}" },
  "mymentor-author-application-received.html": { preview: "Your author application is awaiting review.", label: "Author application", title: "Application received", paragraphs: ["Hi {{first_name}}, we received your application to write for My Mentor. Our team will review it and email you with a decision.", "If you received a separate email confirmation link, please use it to verify your address."], note: "You cannot access the author dashboard until your application is approved." },
  "mymentor-author-account-approved.html": { preview: "Your author application was approved.", label: "Author application", title: "You’re approved to write", paragraphs: ["Hi {{first_name}}, your author application was approved. Sign in to draft and submit articles.", "Every submission is reviewed before publication."], button: "Open author dashboard", url: "{{author_dashboard_url}}" },
  "mymentor-author-application-declined.html": { preview: "A decision on your author application.", label: "Author application", title: "Application not approved", paragraphs: ["Hi {{first_name}}, we reviewed your author application and cannot approve it.", "Reviewer feedback: {{review_feedback}}"], note: "Questions? Email hello@mymentor.digital." },
  "mymentor-article-received-pending-review.html": { preview: "Your article was submitted for review.", label: "Article review", title: "Article submitted", paragraphs: ["Hi {{first_name}}, “{{article_title}}” was submitted for editorial review. It is not published yet.", "We’ll email you when a decision is made."], button: "View your articles", url: "{{author_dashboard_url}}" },
  "mymentor-article-published.html": { preview: "Your article is now live on My Mentor.", label: "Article review", title: "Your article is live", paragraphs: ["Hi {{first_name}}, “{{article_title}}” is now published on My Mentor. Thank you for contributing."], button: "Read your article", url: "{{article_url}}" },
  "mymentor-article-declined.html": { preview: "A decision on your article submission.", label: "Article review", title: "Article not approved", paragraphs: ["Hi {{first_name}}, we reviewed “{{article_title}}” and did not approve it for publication.", "Reviewer feedback: {{review_feedback}}", "You can edit the article and submit it again for review."], button: "Edit your article", url: "{{author_article_url}}" },
  "mymentor-payment-request-created.html": { preview: "Your EFT reference and next steps.", label: "EFT payment", title: "Your EFT request is ready", paragraphs: ["Hi {{first_name}}, your EFT request is saved. This is not a payment confirmation.", "Check the current bank details on your payment page. Send the exact amount using the reference below, then upload proof and select “Send proof for review”."], facts: [["Access", "{{payment_product}}"], ["Amount", "{{payment_amount}}"], ["Reference", "{{payment_reference}}"]], button: "View bank details", url: "{{payments_url}}", note: "New course access is granted only after we verify the deposit." },
  "mymentor-payment-proof-received.html": { preview: "Your EFT proof is awaiting review.", label: "EFT payment", title: "Proof submitted for review", paragraphs: ["Hi {{first_name}}, we received your proof for the EFT request below.", "We’ll check the deposit in our bank account and email you with a decision. Your proof alone does not approve the payment."], facts: [["Reference", "{{payment_reference}}"], ["Amount", "{{payment_amount}}"]], button: "Track your request", url: "{{payments_url}}" },
  "mymentor-payment-approved.html": { preview: "Your EFT was approved and your course access is active.", label: "EFT payment", title: "Payment approved", paragraphs: ["Hi {{first_name}}, we verified your EFT and approved this request. Your selected course access is now active."], facts: [["Access", "{{payment_product}}"], ["Amount", "{{payment_amount}}"], ["Reference", "{{payment_reference}}"]], button: "Open your course", url: "{{course_url}}" },
  "mymentor-payment-needs-resubmission.html": { preview: "Action needed: submit new EFT proof.", label: "EFT payment", title: "Please submit new proof", paragraphs: ["Hi {{first_name}}, we could not verify the proof submitted for this request.", "Reason: {{payment_note}}", "Upload a new, clear image on your payment page and select “Send proof for review” again."], facts: [["Reference", "{{payment_reference}}"]], button: "Upload new proof", url: "{{payments_url}}", note: "Do not make a second EFT unless our team asks you to." },
  "mymentor-payment-rejected.html": { preview: "Your EFT request was not approved.", label: "EFT payment", title: "EFT request not approved", paragraphs: ["Hi {{first_name}}, we reviewed your EFT request and could not approve it.", "Reason: {{payment_note}}", "This request is closed. It did not add course access."], facts: [["Reference", "{{payment_reference}}"]], button: "View payment history", url: "{{payments_url}}", note: "If money left your bank account, email hello@mymentor.digital with this reference before starting another request." },
  "mymentor-payment-cancelled.html": { preview: "Your EFT request was cancelled.", label: "EFT payment", title: "EFT request cancelled", paragraphs: ["Hi {{first_name}}, you cancelled this EFT request. No further review will take place, and this request will not grant new course access."], facts: [["Reference", "{{payment_reference}}"]], button: "View payments", url: "{{payments_url}}", note: "If you already sent the EFT, email hello@mymentor.digital with this reference before making another payment." },
  "mymentor-admin-notification.html": { preview: "An item needs attention in My Mentor.", label: "Admin notification", title: "{{notification_title}}", paragraphs: ["{{notification_details}}"], button: "Review in admin", url: "{{notification_url}}" },
  "mymentor-thread-verification.html": { preview: "Your six-digit comment verification code.", label: "Comment verification", title: "Verify your email", paragraphs: ["Enter this code to verify your email before commenting on My Mentor:"], facts: [["Your code", "{{verification_code}}"]], note: "This code expires in 10 minutes. If you did not request it, you can ignore this message." },
};

fs.mkdirSync(output, { recursive: true });
for (const [file, message] of Object.entries(messages)) fs.writeFileSync(path.join(output, file), email(message));

const authOutput = path.join(process.cwd(), "supabase", "email-templates");
fs.mkdirSync(authOutput, { recursive: true });
const authMessages = {
  "confirm-signup.html": { preview: "Confirm your My Mentor email address.", label: "Account confirmation", title: "Confirm your email", paragraphs: ["Confirm this email address to finish setting up your My Mentor account.", "If you applied to write for us, your author application will be reviewed separately."], button: "Confirm email", url: "{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&amp;type=email&amp;next=/today", note: "If you did not create an account, you can ignore this message." },
  "reset-password.html": { preview: "Choose a new My Mentor password.", label: "Account security", title: "Reset your password", paragraphs: ["We received a request to reset your My Mentor password. Use the link below to choose a new one."], button: "Reset password", url: "{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&amp;type=recovery&amp;next=/auth/reset-password", note: "If you did not request this, you can ignore this message. Your password will stay the same." },
};
for (const [file, message] of Object.entries(authMessages)) fs.writeFileSync(path.join(authOutput, file), email(message));
console.log(`Generated ${Object.keys(messages).length} app email templates and ${Object.keys(authMessages).length} Supabase Auth templates.`);
