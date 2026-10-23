import Link from "next/link";
import { Plus } from "lucide-react";
import { getArticleActor } from "@/lib/article-access";
import { articleStatusLabel, getAuthorArticles } from "@/lib/articles";

export default async function AuthorDashboardPage() {
  const actor = await getArticleActor();
  const articles = actor.user ? await getAuthorArticles(actor.user.id) : [];
  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-sage">Author workspace</p><h1 className="mt-2 text-4xl font-semibold tracking-tight text-forest">Your articles</h1><p className="mt-2 text-sm text-muted">Create drafts, submit them for editorial review, and respond to feedback.</p></div>
        <Link href="/author/articles/new" className="inline-flex items-center justify-center gap-2 rounded-full bg-forest px-5 py-3 text-sm font-semibold text-cream hover:bg-[#223128]"><Plus className="h-4 w-4" />New article</Link>
      </div>
      <div className="mt-8 grid gap-4">
        {articles.map((article) => <Link key={article.id} href={`/author/articles/${article.id}`} className="rounded-[24px] border border-mist bg-cream p-5 transition hover:border-sage hover:shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-sage">{articleStatusLabel(article.status)}</p><h2 className="mt-2 text-xl font-semibold text-text">{article.title}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{article.excerpt || "No excerpt yet."}</p></div><span className="text-xs text-muted">Updated {new Date(article.updated_at).toLocaleDateString()}</span></div>
        </Link>)}
        {!articles.length && <div className="rounded-[24px] border border-dashed border-sage/40 bg-sage/5 p-10 text-center"><h2 className="text-xl font-semibold text-forest">Your workspace is ready.</h2><p className="mt-2 text-sm text-muted">Start a draft when you are ready to submit your first article.</p></div>}
      </div>
    </div>
  );
}
