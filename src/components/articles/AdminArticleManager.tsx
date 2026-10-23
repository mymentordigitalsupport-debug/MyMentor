"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { articleStatusLabel, type ArticleRecord } from "@/lib/articles";

type Application = {
  id: string;
  user_id: string;
  full_name: string;
  public_name: string;
  bio: string;
  expertise_summary: string;
  intended_topics: string[];
  motivation: string;
  website_url: string | null;
  portfolio_url: string | null;
  status: string;
  review_feedback: string | null;
  created_at: string;
};

export function AdminArticleManager({ articles, applications }: { articles: ArticleRecord[]; applications: Application[] }) {
  const router = useRouter();
  const [working, setWorking] = useState<string | null>(null);
  const [preview, setPreview] = useState<ArticleRecord | null>(null);

  async function change(payload: Record<string, unknown>) {
    setWorking(String(payload.id ?? payload.articleId));
    try {
      const response = await fetch("/api/admin/articles", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error ?? "Unable to update this item.");
      router.refresh();
    } finally {
      setWorking(null);
    }
  }

  async function reviewApplication(application: Application, status: "approved" | "rejected") {
    const feedback = status === "rejected"
      ? window.prompt("Tell the applicant why their application was not approved.") ?? ""
      : window.prompt("Optional note for the applicant:") ?? "";
    if (status === "rejected" && !feedback) return;
    await change({ type: "application", id: application.id, status, feedback });
  }

  async function reviewArticle(article: ArticleRecord, action: "publish" | "changes_requested" | "reject" | "archive") {
    const needsFeedback = action === "changes_requested" || action === "reject";
    const feedback = needsFeedback
      ? window.prompt(action === "reject" ? "Reason for rejecting this article:" : "Feedback for the author:") ?? ""
      : "";
    if (needsFeedback && !feedback) return;
    await change({ articleId: article.id, action, feedback });
  }

  async function remove(article: ArticleRecord) {
    if (!window.confirm(`Delete “${article.title}”? It will be removed from public and author views.`)) return;
    setWorking(article.id);
    try {
      const response = await fetch(`/api/admin/articles?id=${article.id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Unable to delete article.");
      router.refresh();
    } finally {
      setWorking(null);
    }
  }

  const pending = applications.filter((application) => application.status === "pending");

  return (
    <div className="space-y-10">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sage">Editorial desk</p>
          <h1 className="mt-2 text-3xl font-semibold text-forest">Articles and author approvals</h1>
        </div>
        <Link href="/admin/articles/new" className="inline-flex min-h-11 items-center rounded-full bg-[#233b2d] px-5 py-3 text-sm font-semibold text-[#fffdf8] hover:bg-[#365640]">Create article</Link>
      </section>

      <section>
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl font-semibold text-text">Author applications</h2>
          <span className="text-sm text-muted">{pending.length} pending</span>
        </div>
        <div className="mt-4 grid gap-4">
          {pending.map((application) => (
            <article key={application.id} className="rounded-[24px] border border-mist bg-cream p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-forest">{application.public_name}</h3>
                  <p className="text-sm text-muted">{application.full_name} · {new Date(application.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" loading={working === application.id} onClick={() => reviewApplication(application, "approved")}>Approve author</Button>
                  <Button size="sm" variant="danger" disabled={working === application.id} onClick={() => reviewApplication(application, "rejected")}>Reject</Button>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-muted">{application.bio}</p>
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div><dt className="font-semibold text-text">Experience</dt><dd className="mt-1 text-muted">{application.expertise_summary}</dd></div>
                <div><dt className="font-semibold text-text">Topics</dt><dd className="mt-1 text-muted">{application.intended_topics.join(", ")}</dd></div>
                <div><dt className="font-semibold text-text">Why they want to contribute</dt><dd className="mt-1 text-muted">{application.motivation}</dd></div>
              </dl>
            </article>
          ))}
          {!pending.length && <p className="rounded-2xl border border-dashed border-mist p-5 text-sm text-muted">There are no author applications waiting for review.</p>}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-text">Article queue</h2>
        <div className="mt-4 grid gap-4">
          {articles.map((article) => (
            <article key={article.id} className="rounded-[24px] border border-mist bg-cream p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sage">{articleStatusLabel(article.status)} · {article.category?.name ?? "Uncategorised"}</p>
                  <h3 className="mt-2 text-xl font-semibold text-forest">{article.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted">Written by <span className="font-semibold text-forest">{article.author_name ?? "My Mentor contributor"}</span> · {article.excerpt || "No excerpt yet."}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="secondary" onClick={() => setPreview(article)}>Preview</Button>
                  <Link href={`/admin/articles/${article.id}`} className="rounded-full border border-mist px-3 py-2 text-sm font-semibold text-forest">Edit</Link>
                  {(article.status === "pending_review" || article.status === "draft") && (
                    <Button size="sm" loading={working === article.id} onClick={() => reviewArticle(article, "publish")}>Approve & publish</Button>
                  )}
                  {article.status === "pending_review" && (
                    <>
                      <Button size="sm" variant="secondary" disabled={working === article.id} onClick={() => reviewArticle(article, "changes_requested")}>Request changes</Button>
                      <Button size="sm" variant="danger" disabled={working === article.id} onClick={() => reviewArticle(article, "reject")}>Reject</Button>
                    </>
                  )}
                  {article.status === "published" && <Button size="sm" variant="secondary" disabled={working === article.id} onClick={() => reviewArticle(article, "archive")}>Archive</Button>}
                  <Button size="sm" variant="danger" disabled={working === article.id} onClick={() => remove(article)}>Delete</Button>
                </div>
              </div>
            </article>
          ))}
          {!articles.length && <p className="rounded-2xl border border-dashed border-mist p-5 text-sm text-muted">No articles have been created yet.</p>}
        </div>
      </section>

      <Modal isOpen={Boolean(preview)} onClose={() => setPreview(null)} title="Article preview" className="max-w-4xl max-h-[calc(100vh-2rem)] overflow-y-auto">
        {preview ? <article className="pb-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sage">{preview.category?.name ?? "Uncategorised"} · {articleStatusLabel(preview.status)}</p>
          <h1 className="mt-3 font-serif text-4xl font-semibold leading-tight text-forest">{preview.title}</h1>
          <p className="mt-4 text-sm text-muted">Written by <span className="font-semibold text-forest">{preview.author_name ?? "My Mentor contributor"}</span></p>
          {preview.cover_image_url ? <img src={preview.cover_image_url} alt="" className="mt-6 aspect-[16/8] w-full rounded-2xl border border-mist object-cover" /> : null}
          {preview.excerpt ? <p className="mt-6 text-lg leading-8 text-muted">{preview.excerpt}</p> : null}
          <div className="mt-8 space-y-5 text-[1.02rem] leading-8 text-text">
            {preview.content_markdown.split(/\n{2,}/).filter(Boolean).map((block, index) => {
              const text = block.trim();
              if (text.startsWith("### ")) return <h3 key={index} className="pt-2 text-xl font-semibold text-forest">{text.slice(4)}</h3>;
              if (text.startsWith("## ") || text.startsWith("# ")) return <h2 key={index} className="pt-3 text-2xl font-semibold text-forest">{text.replace(/^#{1,2}\s/, "")}</h2>;
              if (text.split("\n").every((line) => line.startsWith("- "))) return <ul key={index} className="list-disc space-y-2 pl-6">{text.split("\n").map((line) => <li key={line}>{line.slice(2)}</li>)}</ul>;
              return <p key={index} className="whitespace-pre-line">{text}</p>;
            })}
          </div>
        </article> : null}
      </Modal>
    </div>
  );
}
