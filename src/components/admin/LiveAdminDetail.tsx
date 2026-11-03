import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { AdminContentItem } from "@/lib/admin/content";
import { formatShortDate } from "@/lib/utils";

export function LiveAdminDetail({ item, backHref, backLabel }: { item: AdminContentItem; backHref: string; backLabel: string }) {
  return <div className="space-y-6">
    <Button asChild variant="secondary" size="sm"><Link href={backHref}><ArrowLeft className="h-4 w-4" />{backLabel}</Link></Button>
    <Card variant="default" padding="lg">
      <Badge variant="forest">Live data</Badge>
      <div className="mt-4 flex flex-wrap items-center gap-3"><h1 className="text-2xl font-semibold text-text">{item.title}</h1>{item.status ? <Badge variant={item.status === "Published" ? "sage" : "gold"}>{item.status}</Badge> : null}</div>
      {item.description ? <p className="mt-4 max-w-3xl text-sm leading-6 text-muted">{item.description}</p> : null}
      <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div><dt className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Record ID</dt><dd className="mt-1 break-all text-sm text-text">{item.id}</dd></div>
        <div><dt className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Last updated</dt><dd className="mt-1 text-sm text-text">{item.updatedAt ? formatShortDate(item.updatedAt) : "Unknown"}</dd></div>
        {item.details.map((detail) => <div key={detail}><dt className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Detail</dt><dd className="mt-1 text-sm text-text">{detail}</dd></div>)}
      </dl>
    </Card>
  </div>;
}
