import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { getEnrichedVisitors } from "@/lib/admin-data";

interface VisitorDetailPageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return getEnrichedVisitors("all").map((item) => ({ id: item.id }));
}

export default async function VisitorDetailPage({ params }: VisitorDetailPageProps) {
  const { id } = await params;
  const visitor = getEnrichedVisitors("all").find((item) => item.id === id);

  if (!visitor) notFound();

  return (
    <div className="page-stack max-w-2xl">
      <Link
        href={routes.dashboard.inspector.visitors.root}
        className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        Visitors
      </Link>
      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            {visitor.guestName}
          </h1>
          <Badge variant={visitor.status === "pending" ? "secondary" : "outline"}>
            {visitor.status}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Flat {visitor.flatNumber} · {visitor.residentName}
        </p>
      </header>
      <dl className="surface-card divide-y text-sm">
        <div className="grid gap-1 px-4 py-3 sm:grid-cols-3">
          <dt className="text-muted-foreground">Purpose</dt>
          <dd className="sm:col-span-2">{visitor.purpose}</dd>
        </div>
        <div className="grid gap-1 px-4 py-3 sm:grid-cols-3">
          <dt className="text-muted-foreground">Expected</dt>
          <dd className="sm:col-span-2">
            {visitor.expectedDate} · {visitor.expectedTime}
          </dd>
        </div>
      </dl>
      {visitor.status === "pending" && (
        <div className="flex gap-2">
          <Button size="sm">Approve</Button>
          <Button size="sm" variant="outline">
            Reject
          </Button>
        </div>
      )}
      <Link
        href={routes.dashboard.inspector.flats.detail(visitor.flatId)}
        className="text-sm font-medium text-primary hover:underline"
      >
        Open flat record
      </Link>
    </div>
  );
}
