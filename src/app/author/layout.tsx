import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight, PenLine } from "lucide-react";
import { getArticleActor, isApprovedAuthor } from "@/lib/article-access";
import { AuthorAccountMenu } from "@/components/articles/AuthorAccountMenu";

export const dynamic = "force-dynamic";

export default async function AuthorLayout({ children }: { children: React.ReactNode }) {
  const actor = await getArticleActor();
  if (!actor.user || !isApprovedAuthor(actor.role)) redirect("/authors-login");
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f8f5ef] text-[#24352c]">
      <header className="relative z-20 border-b border-[#b8ad96]/25 bg-[#fbf9f5]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8 lg:px-12">
          <Link href="/author" className="group flex items-center gap-3" aria-label="My Mentor Authors home">
            <span className="grid h-10 w-10 place-items-center rounded-[13px] bg-[#21382c] text-[#e8d4a7] shadow-[0_8px_20px_-10px_#21382c] transition-transform group-hover:-rotate-6"><PenLine className="h-4 w-4" /></span>
            <span className="flex flex-col"><span className="font-serif text-lg leading-none tracking-[-0.03em]">My Mentor</span><span className="mt-1 text-[9px] font-semibold uppercase tracking-[0.28em] text-[#8d7955]">Authors</span></span>
          </Link>
          <nav aria-label="Author navigation" className="flex items-center gap-2 sm:gap-5">
            <Link href="/author" className="hidden min-h-11 items-center text-xs font-semibold uppercase tracking-[0.15em] text-[#435447] transition hover:text-[#9a7e4d] sm:inline-flex">My articles</Link>
            <Link href="/" className="inline-flex min-h-11 items-center gap-1 text-xs font-semibold text-[#435447] transition hover:text-[#9a7e4d]">View site <ArrowUpRight className="h-3.5 w-3.5" /></Link>
            <AuthorAccountMenu email={actor.user.email ?? "Author"} />
          </nav>
        </div>
      </header>
      <main className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-24 pt-8 sm:px-8 sm:pt-11 lg:px-12">{children}</main>
    </div>
  );
}
