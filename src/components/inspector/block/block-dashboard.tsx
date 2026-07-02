import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";
import { routes } from "@/config/routes";
import type { BlockDashboardSummary } from "@/lib/explorer-data";
import { formatCurrency, formatDate } from "@/lib/data";
import { Building2, Wrench } from "lucide-react";

interface BlockDashboardProps {
  summary: BlockDashboardSummary;
}

export function BlockDashboard({ summary }: BlockDashboardProps) {
  if (summary.totalFlats === 0) {
    return (
      <EmptyState
        icon={Building2}
        title={`${summary.blockName} — no flats yet`}
        description="This block is reserved for future expansion."
      />
    );
  }

  return (
    <div className="space-y-6">
      <dl className="surface-card grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <dt className="text-xs text-muted-foreground">Flats</dt>
          <dd className="text-lg font-semibold">
            {summary.totalFlats}{" "}
            <span className="text-sm font-normal text-muted-foreground">
              ({summary.occupiedFlats} occupied)
            </span>
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Outstanding</dt>
          <dd className="text-lg font-semibold tabular-nums">
            {formatCurrency(summary.outstanding)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Overdue flats</dt>
          <dd className="text-lg font-semibold tabular-nums">
            {summary.overdueCount}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Collection</dt>
          <dd className="text-lg font-semibold tabular-nums">
            {summary.collectionRate}%
          </dd>
        </div>
      </dl>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Upcoming services
          </h2>
          {summary.upcomingServices.length === 0 ? (
            <EmptyState
              icon={Wrench}
              title="No upcoming services"
              description="Nothing scheduled for this block."
            />
          ) : (
            <ul className="surface-card divide-y">
              {summary.upcomingServices.map((svc) => (
                <li key={svc.id} className="px-4 py-3">
                  <p className="font-medium">{svc.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {svc.vendor} · {formatDate(svc.scheduledDate)} ·{" "}
                    {svc.scheduledTime}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Follow-ups
            </h2>
            <Link
              href={routes.dashboard.inspector.maintenance.outstanding}
              className="text-sm font-medium text-primary hover:underline"
            >
              View all
            </Link>
          </div>
          {summary.followUps.length === 0 ? (
            <div className="surface-card px-4 py-3.5 text-sm text-muted-foreground">
              No open follow-ups
            </div>
          ) : (
            <ul className="surface-card divide-y">
              {summary.followUps.slice(0, 5).map((fu) => (
                <li key={fu.id}>
                  <Link
                    href={routes.dashboard.inspector.flats.detail(fu.flatId)}
                    className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted/40"
                  >
                    <div>
                      <p className="font-medium">Flat {fu.flatNumber}</p>
                      <p className="text-sm text-muted-foreground">
                        {fu.residentName}
                      </p>
                    </div>
                    <p className="shrink-0 font-semibold tabular-nums text-destructive">
                      {formatCurrency(fu.amountPending)}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
