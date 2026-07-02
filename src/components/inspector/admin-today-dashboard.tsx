import Link from "next/link";
import { AlertTriangle, CheckCircle2, Megaphone, MessageSquare, Wallet } from "lucide-react";
import { AdminDashboardSearch } from "@/components/inspector/admin-dashboard-search";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { routes } from "@/config/routes";
import type { AdminTodayDashboard } from "@/lib/admin-data";
import { cn } from "@/lib/utils";

interface AdminTodayDashboardViewProps {
  data: AdminTodayDashboard;
}

export function AdminTodayDashboardView({ data }: AdminTodayDashboardViewProps) {
  return (
    <div className="space-y-6">
      <AdminDashboardSearch />

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Needs attention today
        </h2>
        {data.attention.length === 0 ? (
          <div className="surface-card flex items-center gap-3 px-4 py-3.5 text-sm text-muted-foreground">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
            All clear — nothing needs attention
          </div>
        ) : (
          <ul className="surface-card divide-y">
            {data.attention.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex flex-col gap-2 px-4 py-3.5 transition-colors hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between sm:gap-3",
                    item.urgent && "bg-destructive/5"
                  )}
                >
                  <span className="flex min-w-0 items-center gap-2 text-sm font-medium">
                    {item.urgent && (
                      <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" />
                    )}
                    <span className="truncate">{item.message}</span>
                  </span>
                  <Badge
                    variant={item.urgent ? "destructive" : "secondary"}
                    className="shrink-0"
                  >
                    {item.actionLabel}
                  </Badge>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <DashboardFeed
          title="Collections"
          viewAllHref={routes.dashboard.inspector.maintenance.payments}
          viewAllLabel="View payments"
          items={data.collectionsActivity}
          emptyIcon={Wallet}
          emptyTitle="No recent payments"
          emptyDescription="Recorded payments will appear here."
        />
        <DashboardFeed
          title="Complaints"
          viewAllHref={routes.dashboard.inspector.complaints.open}
          viewAllLabel="View complaints"
          items={data.complaintsActivity}
          emptyIcon={MessageSquare}
          emptyTitle="No open complaints"
          emptyDescription="New resident complaints will appear here."
        />
        <DashboardFeed
          title="Important announcements"
          viewAllHref={routes.dashboard.inspector.notices.root}
          viewAllLabel="View notices"
          items={data.announcements}
          emptyIcon={Megaphone}
          emptyTitle="No important announcements"
          emptyDescription="High-priority notices and alerts will appear here."
        />
      </div>
    </div>
  );
}

interface DashboardFeedItem {
  id: string;
  label: string;
  href?: string;
  meta?: string;
}

function DashboardFeed({
  title,
  viewAllHref,
  viewAllLabel,
  items,
  emptyIcon,
  emptyTitle,
  emptyDescription,
}: {
  title: string;
  viewAllHref: string;
  viewAllLabel: string;
  items: DashboardFeedItem[];
  emptyIcon: typeof Wallet;
  emptyTitle: string;
  emptyDescription: string;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </h2>
        <Link
          href={viewAllHref}
          className="shrink-0 text-sm font-medium text-primary hover:underline"
        >
          {viewAllLabel}
        </Link>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={emptyIcon}
          title={emptyTitle}
          description={emptyDescription}
          className="py-8"
        />
      ) : (
        <ul className="surface-card divide-y">
          {items.map((item) => (
            <li key={item.id}>
              {item.href ? (
                <Link
                  href={item.href}
                  className="block px-4 py-3 transition-colors hover:bg-muted/40"
                >
                  <FeedItemContent label={item.label} meta={item.meta} />
                </Link>
              ) : (
                <div className="px-4 py-3">
                  <FeedItemContent label={item.label} meta={item.meta} />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function FeedItemContent({ label, meta }: { label: string; meta?: string }) {
  return (
    <>
      <p className="text-sm font-medium">{label}</p>
      {meta && <p className="mt-0.5 text-xs text-muted-foreground">{meta}</p>}
    </>
  );
}
