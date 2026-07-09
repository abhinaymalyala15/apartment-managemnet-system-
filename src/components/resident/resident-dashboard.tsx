import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  Bell,
  CheckCircle2,
  FileSpreadsheet,
  Home,
  Megaphone,
  Users,
  Wallet,
  Wrench,
} from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import { routes } from "@/config/routes";
import {
  formatCurrency,
  formatDate,
  getMonthlyMaintenanceCharge,
  getPaymentStatusLabel,
  isServiceThisWeek,
} from "@/lib/data";
import type { Payment, Resident, Flat, Block } from "@/types";
import { cn } from "@/lib/utils";

const root = routes.dashboard.resident.root;

interface ResidentDashboardProps {
  resident: Resident;
  flat: Flat;
  block: Block;
  payments: Payment[];
  notices: ReturnType<typeof import("@/lib/data").getNotices>;
  services: ReturnType<typeof import("@/lib/data").getServices>;
}

export function ResidentDashboard({
  resident,
  flat,
  block,
  payments,
  notices,
  services,
}: ResidentDashboardProps) {
  const firstName = resident.fullName.split(" ")[0];
  const monthlyCharge = getMonthlyMaintenanceCharge(flat);
  const overdue = payments.find((p) => p.status === "overdue");
  const pending = payments.find((p) => p.status === "pending");
  const dueBill = overdue ?? pending;
  const isPaid = !dueBill;

  const urgentNotice = notices.find(
    (n) => n.priority === "high" || n.category === "emergency"
  );
  const latestNotice = urgentNotice ?? notices[0];

  const nextVisit = services
    .filter((s) => s.status === "scheduled" && isServiceThisWeek(s))
    .sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate))[0];

  const quickLinks = [
    { label: "Bills", href: `${root}/payments`, icon: Wallet },
    { label: "Notices", href: `${root}/notices`, icon: Bell },
    { label: "My flat", href: `${root}/flat`, icon: Home },
    { label: "Family", href: `${root}/family`, icon: Users },
    { label: "Visits", href: `${root}/services`, icon: Wrench },
    {
      label: "Balance Sheet",
      href: routes.dashboard.resident.financialStatements,
      icon: FileSpreadsheet,
    },
  ];

  return (
    <div className="page-stack pb-2">
      <section className="surface-card bg-gradient-to-br from-primary/8 via-card to-card p-5 sm:p-6">
        <p className="text-sm text-muted-foreground">Good morning</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
          {firstName}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Flat {flat.flatNumber} · {block.name}
        </p>
      </section>

      <Link
        href={`${root}/payments`}
        className={cn(
          "surface-card block p-4 transition-colors hover:border-primary/30 sm:p-5",
          isPaid
            ? "border-success/40 bg-success/5"
            : overdue
              ? "border-destructive/30 bg-destructive/5"
              : "border-warning/50 bg-warning/30"
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Maintenance
            </p>
            <p className="mt-1 text-xl font-semibold tabular-nums">
              {isPaid ? "All paid" : formatCurrency(dueBill!.amount)}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {isPaid
                ? `₹${monthlyCharge.toLocaleString("en-IN")}/month · no pending dues`
                : `${dueBill!.period} · ${getPaymentStatusLabel(dueBill!.status)} · due ${formatDate(dueBill!.dueDate)}`}
            </p>
          </div>
          {isPaid ? (
            <CheckCircle2 className="h-6 w-6 shrink-0 text-success" />
          ) : (
            <AlertCircle
              className={cn(
                "h-6 w-6 shrink-0",
                overdue ? "text-destructive" : "text-warning-foreground"
              )}
            />
          )}
        </div>
      </Link>

      {(latestNotice || nextVisit) && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-foreground">Updates</h2>
          <div className="surface-card divide-y">
            {latestNotice && (
              <UpdateRow
                href={`${root}/notices`}
                icon={Megaphone}
                title={latestNotice.title}
                meta={formatDate(latestNotice.publishedAt)}
                urgent={
                  latestNotice.priority === "high" ||
                  latestNotice.category === "emergency"
                }
              />
            )}
            {nextVisit && (
              <UpdateRow
                href={`${root}/services`}
                icon={Wrench}
                title={nextVisit.title}
                meta={`${formatDate(nextVisit.scheduledDate)} · ${nextVisit.scheduledTime}`}
              />
            )}
          </div>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Quick access</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="surface-card flex items-center gap-3 px-3 py-3 text-sm font-medium transition-colors hover:border-primary/30"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <link.icon className="h-4 w-4" />
              </span>
              {link.label}
            </Link>
          ))}
        </div>
      </section>

      {!isPaid && (
        <div className="flex justify-center pt-1">
          <ButtonLink href={`${root}/payments`} variant="outline" size="sm">
            View bills & receipts
            <ArrowRight className="h-4 w-4" />
          </ButtonLink>
        </div>
      )}
    </div>
  );
}

function UpdateRow({
  href,
  icon: Icon,
  title,
  meta,
  urgent,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  meta: string;
  urgent?: boolean;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-3.5 text-sm hover:bg-muted/40"
    >
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
          urgent ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="line-clamp-1 font-medium">{title}</span>
        <span className="mt-0.5 block text-xs text-muted-foreground">{meta}</span>
      </span>
      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
    </Link>
  );
}
