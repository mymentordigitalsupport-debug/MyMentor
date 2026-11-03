import Link from "next/link";
import { ArrowRight, Database } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { AdminContentItem } from "@/lib/admin/content";
import { formatShortDate } from "@/lib/utils";

function statusVariant(status?: string) {
  if (status === "Published") return "sage" as const;
  if (status === "Draft") return "gold" as const;
  return "forest" as const;
}

export function LiveAdminCollection({
  title,
  description,
  items,
  createHref,
  createLabel,
}: {
  title: string;
  description: string;
  items: AdminContentItem[];
  createHref?: string;
  createLabel?: string;
}) {
  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <Badge variant="forest">Live data</Badge>
          <h1 className="mt-3 text-2xl font-semibold text-text">{title}</h1>
          <p className="mt-1 text-sm text-muted">{description}</p>
        </div>
        {createHref && createLabel ? <Button asChild variant="primary" size="sm"><Link href={createHref}>{createLabel}<ArrowRight className="h-4 w-4" /></Link></Button> : null}
      </section>

      <Card variant="mist" padding="sm">
        <div className="flex items-center gap-3 text-sm text-muted"><Database className="h-4 w-4 text-forest" /><span>{items.length} live record{items.length === 1 ? "" : "s"}</span></div>
      </Card>

      <section className="space-y-3">
        {items.map((item) => <Card key={item.id} variant="default" padding="lg">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2"><h2 className="text-lg font-semibold text-text">{item.title}</h2>{item.status ? <Badge variant={statusVariant(item.status)}>{item.status}</Badge> : null}</div>
              {item.description ? <p className="mt-2 break-words text-sm text-muted">{item.description}</p> : null}
              <div className="mt-3 flex flex-wrap gap-2">{item.details.map((detail) => <Badge key={detail} variant="muted">{detail}</Badge>)}</div>
              <p className="mt-3 text-xs text-muted">Updated {item.updatedAt ? formatShortDate(item.updatedAt) : "unknown"}</p>
            </div>
            {item.href ? <Button asChild variant="secondary" size="sm"><Link href={item.href}>Open<ArrowRight className="h-4 w-4" /></Link></Button> : null}
          </div>
        </Card>)}
        {items.length === 0 ? <Card variant="default" padding="lg"><p className="text-sm text-muted">No records yet.</p></Card> : null}
      </section>
    </div>
  );
}
