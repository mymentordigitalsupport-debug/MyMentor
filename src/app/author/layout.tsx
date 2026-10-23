import Link from "next/link";
import { redirect } from "next/navigation";
import { PenLine } from "lucide-react";
import { getArticleActor, isApprovedAuthor } from "@/lib/article-access";

export const dynamic = "force-dynamic";

export default async function AuthorLayout({ children }: { children: React.ReactNode }) {
  const actor = await getArticleActor();
  if (!actor.user || !isApprovedAuthor(actor.role)) redirect("/authors-login");
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fbf9f5_0%,#f6f3ed_100%)]">
      <header className="border-b border-mist bg-cream/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Link href="/author" className="flex items-center gap-2 font-semibold text-forest"><span className="grid h-9 w-9 place-items-center rounded-xl bg-forest text-cream"><PenLine className="h-4 w-4" /></span>My Mentor Authors</Link>
          <nav className="flex items-center gap-4 text-sm font-medium text-muted"><Link href="/author" className="hover:text-forest">My articles</Link><Link href="/" className="hover:text-forest">View site</Link></nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 sm:py-10">{children}</main>
    </div>
  );
}
