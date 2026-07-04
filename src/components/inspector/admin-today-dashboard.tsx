import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  CheckCircle2,
  ChevronRight,
  Circle,
  Megaphone,
  MessageSquare,
  Receipt,
  UserCheck,
  Wallet,
  Wrench,
} from "lucide-react";
import { AdminDashboardSearch } from "@/components/inspector/admin-dashboard-search";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { routes } from "@/config/routes";
import type { AdminTodayAttentionItem, AdminTodayDashboard } from "@/lib/admin-data";
import { cn } from "@/lib/utils";

interface AdminTodayDashboardViewProps {
  data: AdminTodayDashboard;
}

const ATTENTION_STYLES: Record<
  string,
  {
    icon: typeof AlertTriangle;
    card: string;
    iconWrap: string;
    iconColor: string;
    badge: string;
    category: string;
  }
> = {
  Outstanding: {
    icon: AlertTriangle,
    card: "border-red-200/80 bg-red-50/40 hover:border-red-300/80 hover:bg-red-50/70 dark:border-red-900/40 dark:bg-red-950/20",
    iconWrap: "bg-red-100 dark:bg-red-950/50",
    iconColor: "text-red-600 dark:text-red-400",
    badge: "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300",
    category: "Outstanding bills",
  },
  Complaints: {
    icon: MessageSquare,
    card: "border-orange-200/80 bg-orange-50/40 hover:border-orange-300/80 hover:bg-orange-50/70 dark:border-orange-900/40 dark:bg-orange-950/20",
    iconWrap: "bg-orange-100 dark:bg-orange-950/50",
    iconColor: "text-orange-600 dark:text-orange-400",
    badge: "bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300",
    category: "Open complaint",
  },
  Visitors: {
    icon: UserCheck,
    card: "border-amber-200/80 bg-amber-50/40 hover:border-amber-300/80 hover:bg-amber-50/70 dark:border-amber-900/40 dark:bg-amber-950/20",
    iconWrap: "bg-amber-100 dark:bg-amber-950/50",
    iconColor: "text-amber-600 dark:text-amber-400",
    badge: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300",
    category: "Pending approval",
  },
  Notices: {
    icon: Bell,
    card: "border-blue-200/80 bg-blue-50/40 hover:border-blue-300/80 hover:bg-blue-50/70 dark:border-blue-900/40 dark:bg-blue-950/20",
    iconWrap: "bg-blue-100 dark:bg-blue-950/50",
    iconColor: "text-blue-600 dark:text-blue-400",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300",
    category: "Draft notice",
  },
  Services: {
    icon: Wrench,
    card: "border-emerald-200/80 bg-emerald-50/40 hover:border-emerald-300/80 hover:bg-emerald-50/70 dark:border-emerald-900/40 dark:bg-emerald-950/20",
    iconWrap: "bg-emerald-100 dark:bg-emerald-950/50",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
    category: "Scheduled today",
  },
};

const DEFAULT_ATTENTION_STYLE = ATTENTION_STYLES.Outstanding!;

function parseAttentionTitle(message: string): string {
  const parts = message.split(" · ");
  if (parts.length > 1) {
    return parts[parts.length - 1]!;
  }
  return message.charAt(0).toUpperCase() + message.slice(1);
}

function parseAttentionSubtitle(message: string, category: string): string {
  const parts = message.split(" · ");
  if (parts.length > 1) {
    return parts.slice(0, -1).join(" · ");
  }
  return category;
}

function getAttentionStyle(actionLabel: string) {
  return ATTENTION_STYLES[actionLabel] ?? DEFAULT_ATTENTION_STYLE;
}

function parsePaymentItem(label: string, meta?: string) {
  const flatMatch = label.match(/Flat\s+(\S+)/i);
  const flat = flatMatch?.[1] ?? "—";
  const amount = meta?.split("·")[0]?.trim() ?? "";
  const date = meta?.split("·")[1]?.trim();
  return { flat, amount, date };
}

function getPriorityStyles(meta?: string) {
  if (meta?.toLowerCase().includes("high")) {
    return { dot: "bg-red-500", badge: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300" };
  }
  if (meta?.toLowerCase().includes("medium")) {
    return {
      dot: "bg-orange-500",
      badge: "bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300",
    };
  }
  return { dot: "bg-blue-400", badge: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300" };
}

function parseComplaintItem(label: string) {
  const parts = label.split(" · ");
  if (parts.length >= 2) {
    return { flat: parts[0]!, title: parts.slice(1).join(" · ") };
  }
  return { flat: "", title: label };
}

export function AdminTodayDashboardView({ data }: AdminTodayDashboardViewProps) {
  return (
    <div className="space-y-5">
      <AdminDashboardSearch />

      <section className="space-y-3">
        <SectionHeading title="Needs attention today" />
        {data.attention.length === 0 ? (
          <div className="flex items-center gap-3 rounded-xl border border-emerald-200/70 bg-emerald-50/50 px-4 py-3.5 text-sm text-emerald-800 shadow-sm dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-200">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            All clear — nothing needs attention
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {data.attention.map((item) => (
              <AttentionCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>

      <div className="grid gap-5 lg:grid-cols-3">
        <CollectionsPanel items={data.collectionsActivity} />
        <ComplaintsPanel items={data.complaintsActivity} />
        <AnnouncementsPanel items={data.announcements} />
      </div>
    </div>
  );
}

function SectionHeading({ title }: { title: string }) {
  return (
    <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      {title}
    </h2>
  );
}

function AttentionCard({ item }: { item: AdminTodayAttentionItem }) {
  const style = getAttentionStyle(item.actionLabel);
  const Icon = style.icon;
  const title = parseAttentionTitle(item.message);
  const subtitle = parseAttentionSubtitle(item.message, style.category);

  return (
    <Link
      href={item.href}
      className={cn(
        "group flex items-start gap-3 rounded-xl border p-4 shadow-sm transition-all",
        "hover:-translate-y-0.5 hover:shadow-md",
        style.card,
        item.urgent && "ring-1 ring-red-300/50 dark:ring-red-800/50"
      )}
    >
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
          style.iconWrap
        )}
      >
        <Icon className={cn("h-5 w-5", style.iconColor)} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold leading-snug text-foreground">{title}</p>
        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{subtitle}</p>
        <span
          className={cn(
            "mt-2 inline-flex rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
            style.badge
          )}
        >
          {item.actionLabel}
        </span>
      </div>
      <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
    </Link>
  );
}

function PanelCard({
  title,
  viewAllHref,
  viewAllLabel,
  children,
}: {
  title: string;
  viewAllHref: string;
  viewAllLabel: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col rounded-xl border bg-card shadow-sm">
      <div className="flex items-center justify-between gap-2 border-b px-4 py-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </h2>
      </div>
      <div className="flex-1 p-2">{children}</div>
      <div className="border-t px-4 py-2.5">
        <Link
          href={viewAllHref}
          className="inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80"
        >
          {viewAllLabel}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </section>
  );
}

function CollectionsPanel({
  items,
}: {
  items: AdminTodayDashboard["collectionsActivity"];
}) {
  return (
    <PanelCard
      title="Collections"
      viewAllHref={routes.dashboard.inspector.maintenance.payments}
      viewAllLabel="View all payments"
    >
      {items.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="No recent payments"
          description="Recorded payments will appear here."
          className="py-6"
        />
      ) : (
        <ul className="space-y-1">
          {items.map((item) => {
            const { flat, amount, date } = parsePaymentItem(item.label, item.meta);
            const content = (
              <>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/30">
                  <Receipt className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">Flat {flat}</p>
                  {date && <p className="text-xs text-muted-foreground">{date}</p>}
                </div>
                {amount && (
                  <p className="shrink-0 text-sm font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                    {amount}
                  </p>
                )}
              </>
            );

            return (
              <li key={item.id}>
                {item.href ? (
                  <Link
                    href={item.href}
                    className="flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-muted/50"
                  >
                    {content}
                  </Link>
                ) : (
                  <div className="flex items-center gap-3 px-2 py-2.5">{content}</div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </PanelCard>
  );
}

function ComplaintsPanel({
  items,
}: {
  items: AdminTodayDashboard["complaintsActivity"];
}) {
  return (
    <PanelCard
      title="Complaints"
      viewAllHref={routes.dashboard.inspector.complaints.open}
      viewAllLabel="View all complaints"
    >
      {items.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No open complaints"
          description="New resident complaints will appear here."
          className="py-6"
        />
      ) : (
        <ul className="space-y-1">
          {items.map((item) => {
            const { flat, title } = parseComplaintItem(item.label);
            const priority = getPriorityStyles(item.meta);

            const content = (
              <>
                <Circle className={cn("h-2.5 w-2.5 shrink-0 fill-current", priority.dot)} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium leading-snug">{title}</p>
                  {flat && <p className="mt-0.5 text-xs text-muted-foreground">{flat}</p>}
                  {item.meta && (
                    <span
                      className={cn(
                        "mt-1.5 inline-flex rounded-md px-1.5 py-0.5 text-[10px] font-medium",
                        priority.badge
                      )}
                    >
                      {item.meta}
                    </span>
                  )}
                </div>
              </>
            );

            return (
              <li key={item.id}>
                {item.href ? (
                  <Link
                    href={item.href}
                    className="flex items-start gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-muted/50"
                  >
                    {content}
                  </Link>
                ) : (
                  <div className="flex items-start gap-3 px-2 py-2.5">{content}</div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </PanelCard>
  );
}

function AnnouncementsPanel({
  items,
}: {
  items: AdminTodayDashboard["announcements"];
}) {
  return (
    <PanelCard
      title="Important announcements"
      viewAllHref={routes.dashboard.inspector.notices.root}
      viewAllLabel="View all notices"
    >
      {items.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="No important announcements"
          description="High-priority notices and alerts will appear here."
          className="py-6"
        />
      ) : (
        <ul className="space-y-1">
          {items.map((item, index) => {
            const content = (
              <>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/30">
                  <Megaphone className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start gap-2">
                    <p className="text-sm font-medium leading-snug">{item.label}</p>
                    {index === 0 && (
                      <Badge variant="destructive" className="shrink-0 px-1.5 py-0 text-[10px]">
                        New
                      </Badge>
                    )}
                  </div>
                  {item.meta && (
                    <p className="mt-0.5 text-xs text-muted-foreground">{item.meta}</p>
                  )}
                </div>
              </>
            );

            return (
              <li key={item.id}>
                {item.href ? (
                  <Link
                    href={item.href}
                    className="flex items-start gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-muted/50"
                  >
                    {content}
                  </Link>
                ) : (
                  <div className="flex items-start gap-3 px-2 py-2.5">{content}</div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </PanelCard>
  );
}
