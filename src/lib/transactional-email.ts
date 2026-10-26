import { readFile } from "node:fs/promises";
import path from "node:path";
import { resend } from "@/lib/resend";

export const EMAIL_TEMPLATES = {
  memberWelcome: { file: "mymentor-member-registration-welcome.html", subject: "Welcome to My Mentor" },
  authorApplicationReceived: { file: "mymentor-author-application-received.html", subject: "We received your author application" },
  authorApproved: { file: "mymentor-author-account-approved.html", subject: "Your My Mentor author account is approved" },
  authorDeclined: { file: "mymentor-author-application-declined.html", subject: "An update on your author application" },
  articleReceived: { file: "mymentor-article-received-pending-review.html", subject: "Your article is pending review" },
  articlePublished: { file: "mymentor-article-published.html", subject: "Your article is now published" },
  articleDeclined: { file: "mymentor-article-declined.html", subject: "An update on your article submission" },
  adminNotification: { file: null, subject: "New My Mentor admin notification" },
} as const;

export type TransactionalTemplate = keyof typeof EMAIL_TEMPLATES;
type TemplateData = Record<string, string>;
type EmailEvent = {
  id: string;
  event_key: string;
  template_name: TransactionalTemplate;
  recipient_email: string;
  payload: TemplateData;
  attempts: number;
};

const templateCache = new Map<string, string>();

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character] ?? character);
}

function appUrl(pathname: string) {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  const fallback = process.env.NODE_ENV === "production" ? "" : "http://localhost:3000";
  const base = configured || fallback;
  if (!base) throw new Error("NEXT_PUBLIC_SITE_URL is required for transactional email.");
  const url = new URL(pathname, base);
  if (!/^https?:$/.test(url.protocol)) throw new Error("Transactional email URL must use HTTP or HTTPS.");
  return url.toString();
}

function sender() {
  const email = process.env.RESEND_FROM_EMAIL?.trim() ?? "";
  if (!/^\S+@mymentor\.digital$/i.test(email)) throw new Error("RESEND_FROM_EMAIL must use the verified mymentor.digital domain.");
  return `My Mentor <${email}>`;
}

async function loadTemplate(template: TransactionalTemplate) {
  const name = EMAIL_TEMPLATES[template].file;
  if (!name) throw new Error("This email uses an inline notification template.");
  const cached = templateCache.get(name);
  if (cached) return cached;
  const html = await readFile(path.join(process.cwd(), "public", "assets", "emails", name), "utf8");
  templateCache.set(name, html);
  return html;
}

function renderAdminNotification(values: TemplateData) {
  const title = escapeHtml(values.notification_title || "New My Mentor notification");
  const details = escapeHtml(values.notification_details || "A new item needs your attention.").replace(/\n/g, "<br>");
  const actionUrl = values.notification_url || appUrl("/admin");
  const url = new URL(actionUrl);
  if (!/^https?:$/.test(url.protocol)) throw new Error("Admin notification URL must use HTTP or HTTPS.");
  return `<!doctype html><html lang="en"><body style="margin:0;background:#f7f4ed;color:#203528;font-family:Arial,sans-serif"><main style="max-width:600px;margin:32px auto;background:#fffdf9;border:1px solid #d9e1d4;border-radius:18px;padding:32px"><p style="margin:0 0 12px;color:#647b5d;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase">My Mentor admin</p><h1 style="margin:0 0 18px;font-family:Georgia,serif;font-size:28px">${title}</h1><p style="margin:0 0 28px;font-size:16px;line-height:1.6">${details}</p><a href="${escapeHtml(url.toString())}" style="display:inline-block;border-radius:999px;background:#203b2c;color:#fff;text-decoration:none;padding:12px 20px;font-weight:700">Open admin dashboard</a></main></body></html>`;
}

export async function renderTransactionalEmail(template: TransactionalTemplate, values: TemplateData) {
  if (template === "adminNotification") return renderAdminNotification(values);
  const html = await loadTemplate(template);
  const unknown = [...html.matchAll(/\{\{([a-z_]+)\}\}/g)].map((match) => match[1]).filter((key) => !(key in values));
  if (unknown.length) throw new Error(`Unsupported placeholders in ${EMAIL_TEMPLATES[template].file}.`);
  const rendered = html.replace(/\{\{([a-z_]+)\}\}/g, (_, key: string) => escapeHtml(values[key] ?? ""));
  if (/\{\{[a-z_]+\}\}/.test(rendered)) throw new Error(`Unresolved placeholders in ${EMAIL_TEMPLATES[template].file}.`);
  return rendered;
}

export function emailPayload(input: {
  firstName?: string | null;
  articleTitle?: string | null;
  reviewFeedback?: string | null;
  articleSlug?: string | null;
}): TemplateData {
  return {
    first_name: input.firstName?.trim() || "there",
    article_title: input.articleTitle?.trim() || "your article",
    review_feedback: input.reviewFeedback?.trim() || "No additional feedback was provided.",
    dashboard_url: appUrl("/today"),
    author_dashboard_url: appUrl("/author"),
    article_url: appUrl(`/articles/${encodeURIComponent(input.articleSlug?.trim() || "")}`),
  };
}

export async function queueTransactionalEmail(
  admin: any,
  input: { eventKey: string; eventType: string; template: TransactionalTemplate; recipientEmail: string; payload: TemplateData }
) {
  if (!/^\S+@\S+\.\S+$/.test(input.recipientEmail)) throw new Error("Recipient email is invalid.");
  const { error } = await admin.from("transactional_email_events").upsert({
    event_key: input.eventKey,
    event_type: input.eventType,
    template_name: input.template,
    recipient_email: input.recipientEmail.trim().toLowerCase(),
    payload: input.payload,
  }, { onConflict: "event_key", ignoreDuplicates: true });
  if (error) throw error;
  await deliverTransactionalEmail(admin, input.eventKey);
}

export async function queueUserEmail(
  admin: any,
  input: { userId: string; eventKey: string; eventType: string; template: TransactionalTemplate; articleTitle?: string | null; reviewFeedback?: string | null; articleSlug?: string | null; firstName?: string | null }
) {
  const [{ data: profile }, { data: authResult, error: authError }] = await Promise.all([
    admin.from("profiles").select("display_name").eq("user_id", input.userId).maybeSingle(),
    admin.auth.admin.getUserById(input.userId),
  ]);
  if (authError || !authResult?.user?.email) throw new Error("Recipient account email is unavailable.");
  await queueTransactionalEmail(admin, {
    eventKey: input.eventKey,
    eventType: input.eventType,
    template: input.template,
    recipientEmail: authResult.user.email,
    payload: emailPayload({ firstName: input.firstName ?? profile?.display_name, articleTitle: input.articleTitle, reviewFeedback: input.reviewFeedback, articleSlug: input.articleSlug }),
  });
}

export async function queueAdminNotification(
  admin: any,
  input: { eventKey: string; eventType: string; title: string; details: string; pathname?: string }
) {
  const recipientEmail = process.env.ADMIN_NOTIFICATION_EMAIL?.trim() ?? "";
  if (!/^\S+@\S+\.\S+$/.test(recipientEmail)) throw new Error("ADMIN_NOTIFICATION_EMAIL is not configured.");
  await queueTransactionalEmail(admin, {
    eventKey: input.eventKey,
    eventType: input.eventType,
    template: "adminNotification",
    recipientEmail,
    payload: {
      notification_title: input.title.slice(0, 180),
      notification_details: input.details.slice(0, 2_000),
      notification_url: appUrl(input.pathname ?? "/admin"),
    },
  });
}

export async function deliverTransactionalEmail(admin: any, eventKey: string) {
  const { data, error } = await admin.rpc("claim_transactional_email_event", { p_event_key: eventKey });
  if (error) throw error;
  const event = (data?.[0] ?? null) as EmailEvent | null;
  if (!event) return false;

  try {
    if (!resend) throw new Error("Resend is not configured.");
    const html = await renderTransactionalEmail(event.template_name, event.payload);
    const result = await resend.emails.send(
      { from: sender(), to: event.recipient_email, subject: EMAIL_TEMPLATES[event.template_name].subject, html },
      { idempotencyKey: event.event_key }
    );
    if (result.error) throw new Error("Resend rejected the message.");
    const { error: updateError } = await admin.from("transactional_email_events").update({ status: "sent", resend_email_id: result.data?.id ?? null, last_error: null, sent_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("id", event.id).eq("status", "sending");
    if (updateError) throw updateError;
    return true;
  } catch (error) {
    const delayMinutes = Math.min(60, 5 * 2 ** Math.max(0, event.attempts - 1));
    await admin.from("transactional_email_events").update({ status: "failed", last_error: error instanceof Error ? error.message.slice(0, 500) : "Email delivery failed.", next_attempt_at: new Date(Date.now() + delayMinutes * 60_000).toISOString(), updated_at: new Date().toISOString() }).eq("id", event.id).eq("status", "sending");
    console.error("[transactional-email] delivery failed", { eventKey: event.event_key, template: event.template_name });
    return false;
  }
}
