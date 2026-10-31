"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { useToast } from "@/components/ui/ToastProvider";
import type { ArticleCategory, ArticleRecord } from "@/lib/articles";

type Props = {
  article?: ArticleRecord | null;
  categories: ArticleCategory[];
  mode: "author" | "admin";
};

export function ArticleEditor({ article, categories, mode }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [form, setForm] = useState({
    title: article?.title ?? "",
    slug: article?.slug ?? "",
    excerpt: article?.excerpt ?? "",
    contentMarkdown: article?.content_markdown ?? "",
    coverImageUrl: article?.cover_image_url ?? "",
    categoryId: article?.category_id ?? "",
    seoTitle: article?.seo_title ?? "",
    seoDescription: article?.seo_description ?? "",
  });

  function update(name: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function uploadCoverImage(file: File | null) {
    if (!file) return;
    setUploadingCover(true);
    try {
      const payload = new FormData();
      payload.append("image", file);
      const response = await fetch("/api/articles/cover-image", { method: "POST", body: payload });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.url) throw new Error(result.error ?? "Unable to upload cover image.");
      update("coverImageUrl", result.url);
      toast.success("Cover image uploaded", "It will be attached when you save the article.");
    } catch (error) {
      toast.error("Image not uploaded", error instanceof Error ? error.message : "Please try again.");
    } finally {
      setUploadingCover(false);
    }
  }

  async function save() {
    setSaving(true);
    try {
      const endpoint = mode === "admin" ? "/api/admin/articles" : article ? `/api/author/articles/${article.id}` : "/api/author/articles";
      const method = article ? "PATCH" : "POST";
      const payload = mode === "admin" && article ? { ...form, articleId: article.id, action: "edit" } : form;
      const response = await fetch(endpoint, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error ?? "Unable to save article.");
      const id = article?.id ?? result.article?.id;
      toast.success("Article saved", article ? "Your changes have been saved." : "Your new draft has been created.");
      router.push(mode === "admin" ? "/admin/articles" : `/author/articles/${id}`);
      router.refresh();
    } catch (error) {
      toast.error("Article not saved", error instanceof Error ? error.message : "Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function submitForReview() {
    if (!article) return;
    setSaving(true);
    try {
      const response = await fetch(`/api/author/articles/${article.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "submit" }) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error ?? "Unable to submit article.");
      toast.success("Submitted for review", "An administrator can now approve, return, or reject this article.");
      router.push("/author");
      router.refresh();
    } catch (error) {
      toast.error("Article not submitted", error instanceof Error ? error.message : "Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const canSubmit = mode === "author" && article && ["draft", "changes_requested", "rejected"].includes(article.status);
  return (
    <div className="grid gap-6">
      <section className="rounded-[28px] border border-mist bg-cream p-5 shadow-sm sm:p-7">
        <div className="grid gap-5">
          <Input label="Article title" value={form.title} onChange={(event) => update("title", event.target.value)} required />
          <Input label="URL slug" value={form.slug} onChange={(event) => update("slug", event.target.value)} placeholder="recovery-support-guide" hint="Leave this close to the title; it becomes the public article address." />
          <Textarea label="Excerpt" value={form.excerpt} onChange={(event) => update("excerpt", event.target.value)} maxLength={500} hint="A short summary used in listings and search results." />
          <Textarea label="Article body" value={form.contentMarkdown} onChange={(event) => update("contentMarkdown", event.target.value)} className="min-h-[360px] font-mono text-sm" placeholder="# Heading\n\nWrite the article in Markdown..." required />
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="rounded-2xl border border-mist bg-[#fffdf8] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-text">Cover image</p>
                  <p className="mt-1 text-xs leading-5 text-muted">Upload a JPG, PNG, WebP, or AVIF image up to 5 MB. It is stored in Supabase&apos;s <code>articles_media</code> bucket.</p>
                </div>
                {form.coverImageUrl ? <button type="button" onClick={() => update("coverImageUrl", "")} className="site-profile-button shrink-0 rounded-xl px-3 py-2 text-xs font-semibold">Remove</button> : null}
              </div>
              {form.coverImageUrl ? <img src={form.coverImageUrl} alt="Current article cover" className="mt-4 aspect-[16/9] w-full rounded-xl border border-mist object-cover" /> : null}
              <label className="site-profile-button mt-4 flex cursor-pointer items-center justify-center rounded-xl border border-dashed border-sage/50 bg-sage/5 px-3 py-3 text-sm font-semibold text-forest transition hover:bg-sage/10">
                <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="sr-only" disabled={uploadingCover} onChange={(event) => { void uploadCoverImage(event.target.files?.[0] ?? null); event.currentTarget.value = ""; }} />
                {uploadingCover ? "Uploading image..." : form.coverImageUrl ? "Replace cover image" : "Upload cover image"}
              </label>
            </div>
            <label className="flex flex-col gap-1 text-sm font-medium text-text">Category
              <select value={form.categoryId} onChange={(event) => update("categoryId", event.target.value)} className="w-full rounded-2xl border border-mist bg-cream px-4 py-2.5 text-text focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20">
                <option value="">No category yet</option>
                {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
            </label>
          </div>
        </div>
      </section>
      <section className="rounded-[28px] border border-mist bg-cream p-5 shadow-sm sm:p-7">
        <h2 className="text-lg font-semibold text-text">Search details</h2>
        <div className="mt-5 grid gap-5">
          <Input label="SEO title" value={form.seoTitle} onChange={(event) => update("seoTitle", event.target.value)} hint="Optional. The article title is used when this is blank." />
          <Textarea label="Meta description" value={form.seoDescription} onChange={(event) => update("seoDescription", event.target.value)} maxLength={320} hint="Optional. The excerpt is used when this is blank." />
        </div>
      </section>
      <div className="flex flex-wrap gap-3">
        <Button onClick={save} loading={saving}>{article ? "Save changes" : "Create draft"}</Button>
        {canSubmit && <Button variant="secondary" onClick={submitForReview} disabled={saving}>Submit for review</Button>}
      </div>
    </div>
  );
}
