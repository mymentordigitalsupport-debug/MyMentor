import Link from "next/link";
import { Filter, RotateCcw } from "lucide-react";

export type AdminFilterOptions = {
  books: Array<{ slug: string; title: string }>;
  guidancePaths: Array<{ value: string; label: string }>;
};

export type AdminFilters = {
  book?: string;
  guidance?: string;
};

export function ContentFilters({ options, filters, basePath }: { options: AdminFilterOptions; filters: AdminFilters; basePath: string }) {
  const query = new URLSearchParams();
  if (filters.book) query.set("book", filters.book);
  if (filters.guidance) query.set("guidance", filters.guidance);
  const queryString = query.toString();

  return (
    <form method="get" action={basePath} className="flex flex-wrap items-end gap-3 rounded-2xl border border-mist bg-cream p-4">
      <div className="mr-1 flex items-center gap-2 pb-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
        <Filter className="h-4 w-4 text-forest" />
        Content filters
      </div>
      <label className="grid gap-1 text-xs font-semibold text-muted">
        Book
        <select name="book" defaultValue={filters.book ?? ""} className="min-w-56 rounded-xl border border-mist bg-white px-3 py-2.5 text-sm font-normal text-text outline-none focus:border-sage">
          <option value="">All books</option>
          {options.books.map((book) => <option key={book.slug} value={book.slug}>{book.title}</option>)}
        </select>
      </label>
      <label className="grid gap-1 text-xs font-semibold text-muted">
        Guidance
        <select name="guidance" defaultValue={filters.guidance ?? ""} className="min-w-48 rounded-xl border border-mist bg-white px-3 py-2.5 text-sm font-normal text-text outline-none focus:border-sage">
          <option value="">All guidance</option>
          {options.guidancePaths.map((path) => <option key={path.value} value={path.value}>{path.label}</option>)}
        </select>
      </label>
      <button type="submit" className="rounded-xl bg-forest px-4 py-2.5 text-sm font-semibold text-cream">Apply filters</button>
      {queryString ? <Link href={basePath} className="inline-flex items-center gap-1.5 rounded-xl border border-mist px-4 py-2.5 text-sm font-semibold text-forest"><RotateCcw className="h-4 w-4" />Clear</Link> : null}
    </form>
  );
}

