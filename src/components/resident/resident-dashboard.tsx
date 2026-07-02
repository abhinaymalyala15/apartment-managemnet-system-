import Link from "next/link";
import {
  Bell,
  Calendar,
  CheckCircle2,
  Clock,
  Home,
  IndianRupee,
  Megaphone,
  Phone,
  User,
  Users,
  Wallet,
  Wrench,
  AlertCircle,
} from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ContactCards } from "@/components/shared/contact-cards";
import { ActivityTimeline } from "@/components/shared/activity-timeline";
import { NoticeCardList } from "@/components/resident/notice-card-list";
import { PaymentHistoryList } from "@/components/resident/payment-history-list";
import { ServiceCardList } from "@/components/resident/service-card-list";
import { routes } from "@/config/routes";
import {
  formatCurrency,
  formatDate,
  getCommitteeContacts,
  getDemoTodayIso,
  getMonthlyMaintenanceCharge,
  getNextPaymentDueDate,
  getPaymentStatusLabel,
  getResidentTimeline,
  isServiceThisWeek,
  isServiceToday,
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
  const nextDue = getNextPaymentDueDate(payments);
  const recentPayments = payments.slice(0, 3);
  const importantNotices = notices.filter(
    (n) => n.priority === "high" || n.category === "emergency"
  );
  const displayNotices =
    importantNotices.length > 0 ? importantNotices.slice(0, 2) : notices.slice(0, 2);
  const scheduledServices = services.filter((s) => s.status === "scheduled");
  const todayServices = scheduledServices.filter(isServiceToday);
  const weekServices = scheduledServices.filter(isServiceThisWeek);
  const upcomingServices = scheduledServices
    .filter((s) => s.scheduledDate >= getDemoTodayIso())
    .slice(0, 3);
  const contacts = getCommitteeContacts();
  const timeline = getResidentTimeline(flat.id);

  const todayActions: { label: string; href: string; done?: boolean }[] = [];
  if (dueBill) {
    todayActions.push({
      label: `Pay ${dueBill.period} maintenance (${formatCurrency(dueBill.amount)})`,
      href: `${root}/payments`,
    });
  }
  if (todayServices.length > 0) {
    todayActions.push({
      label: `${todayServices.length} vendor visit${todayServices.length > 1 ? "s" : ""} today — stay available`,
      href: `${root}/services`,
    });
  }
  if (importantNotices.length > 0) {
    todayActions.push({
      label: `Read: ${importantNotices[0]!.title}`,
      href: `${root}/notices`,
    });
  }
  if (todayActions.length === 0) {
    todayActions.push({
      label: "You're all caught up — no action needed today",
      href: root,
      done: true,
    });
  }

  return (
    <div className="page-stack">
      {/* Welcome + at-a-glance answers */}
      <section className="surface-card bg-gradient-to-br from-primary/8 via-card to-card p-5 sm:p-6">
        <p className="text-sm text-muted-foreground">Good morning</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
          {firstName}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Flat {flat.flatNumber} · {block.name} · Floor {flat.floor}
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <AtAGlanceCard
            label="Maintenance"
            value={isPaid ? "All paid" : formatCurrency(dueBill!.amount)}
            sub={
              isPaid
                ? "No pending dues"
                : `${getPaymentStatusLabel(dueBill!.status)} · ${dueBill!.period}`
            }
            icon={isPaid ? CheckCircle2 : overdue ? AlertCircle : Clock}
            tone={isPaid ? "success" : overdue ? "danger" : "warning"}
            href={`${root}/payments`}
          />
          <AtAGlanceCard
            label="Notices"
            value={String(importantNotices.length || notices.length)}
            sub={
              importantNotices.length > 0
                ? `${importantNotices.length} need attention`
                : "No urgent items"
            }
            icon={Megaphone}
            tone={importantNotices.length > 0 ? "warning" : "neutral"}
            href={`${root}/notices`}
          />
          <AtAGlanceCard
            label="This week"
            value={String(weekServices.length)}
            sub={
              weekServices.length > 0
                ? "Scheduled visits"
                : "No visits this week"
            }
            icon={Wrench}
            tone="neutral"
            href={`${root}/services`}
          />
          <AtAGlanceCard
            label="Next due"
            value={nextDue ? formatDate(nextDue) : "—"}
            sub={isPaid ? `₹${monthlyCharge.toLocaleString("en-IN")}/month` : "Payment date"}
            icon={Calendar}
            tone="neutral"
            href={`${root}/payments`}
          />
        </div>
      </section>

      {/* What to do today */}
      <section className="space-y-3">
        <h2 className="section-title">What to do today</h2>
        <ul className="surface-card divide-y">
          {todayActions.map((action) => (
            <li key={action.label}>
              <Link
                href={action.href}
                className="flex items-center gap-3 px-4 py-3.5 text-sm hover:bg-muted/40"
              >
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                    action.done ? "bg-success text-success" : "bg-primary/10 text-primary"
                  )}
                >
                  {action.done ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <Clock className="h-4 w-4" />
                  )}
                </span>
                <span className={action.done ? "text-muted-foreground" : "font-medium"}>
                  {action.label}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Maintenance detail strip */}
      {!isPaid && (
        <section
          className={cn(
            "surface-card p-4",
            overdue ? "border-destructive/30 bg-destructive/5" : "border-warning bg-warning"
          )}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Badge variant={overdue ? "destructive" : "secondary"}>
                {getPaymentStatusLabel(dueBill!.status)}
              </Badge>
              <p className="mt-2 font-semibold">
                {dueBill!.period} · {formatCurrency(dueBill!.amount)}
              </p>
              <p className="text-sm text-muted-foreground">
                Due {formatDate(dueBill!.dueDate)} · View-only in demo
              </p>
            </div>
            <ButtonLink href={`${root}/payments`}>View bill & receipts</ButtonLink>
          </div>
        </section>
      )}

      {/* Important notices */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="section-title">Important notices</h2>
          <ButtonLink href={`${root}/notices`} variant="ghost" size="sm">
            See all
          </ButtonLink>
        </div>
        {displayNotices.length === 0 ? (
          <EmptyState
            icon={Megaphone}
            title="No notices right now"
            description="Society announcements will appear here first."
          />
        ) : (
          <NoticeCardList notices={displayNotices} expandable />
        )}
      </section>

      {/* This week's maintenance work */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="section-title">Maintenance work this week</h2>
          <ButtonLink href={`${root}/services`} variant="ghost" size="sm">
            Full schedule
          </ButtonLink>
        </div>
        {weekServices.length === 0 ? (
          <EmptyState
            icon={Wrench}
            title="Nothing scheduled this week"
            description="Vendor visits for your building or flat will show here."
          />
        ) : (
          <ServiceCardList services={weekServices.slice(0, 4)} showScope />
        )}
      </section>

      {/* Today's visits */}
      {todayServices.length > 0 && (
        <section className="space-y-3">
          <h2 className="section-title">Happening today</h2>
          <ServiceCardList services={todayServices} showScope />
        </section>
      )}

      {/* Quick access */}
      <section className="space-y-3">
        <h2 className="section-title">Quick access</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "My flat", href: `${root}/flat`, icon: Home, hint: flat.flatNumber },
            { label: "Bills", href: `${root}/payments`, icon: Wallet, hint: isPaid ? "Paid" : "Due" },
            { label: "Notices", href: `${root}/notices`, icon: Bell, hint: `${notices.length}` },
            { label: "Visits", href: `${root}/services`, icon: Wrench, hint: `${upcomingServices.length} upcoming` },
          ].map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="surface-card flex flex-col p-4 transition-colors hover:border-primary/30"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <action.icon className="h-5 w-5" />
              </div>
              <p className="mt-3 text-sm font-medium">{action.label}</p>
              <p className="text-xs text-muted-foreground">{action.hint}</p>
            </Link>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            href={`${root}/family`}
            className="surface-card flex items-center justify-between px-4 py-3 text-sm hover:bg-muted/40"
          >
            <span className="flex items-center gap-2 font-medium">
              <Users className="h-4 w-4 text-muted-foreground" />
              Family members
            </span>
            <span className="text-muted-foreground">View →</span>
          </Link>
          <Link
            href={`${root}/profile`}
            className="surface-card flex items-center justify-between px-4 py-3 text-sm hover:bg-muted/40"
          >
            <span className="flex items-center gap-2 font-medium">
              <User className="h-4 w-4 text-muted-foreground" />
              My details
            </span>
            <span className="text-muted-foreground">View →</span>
          </Link>
        </div>
      </section>

      {/* Activity timeline — connected data */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="section-title">Recent activity</h2>
          <ButtonLink href={`${root}/timeline`} variant="ghost" size="sm">
            Full timeline
          </ButtonLink>
        </div>
        <div className="surface-card p-4 pl-5">
          <ActivityTimeline events={timeline} limit={5} compact />
        </div>
      </section>

      {/* Recent payments */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="section-title">Recent payments</h2>
          <ButtonLink href={`${root}/payments`} variant="ghost" size="sm">
            Full history
          </ButtonLink>
        </div>
        {recentPayments.length === 0 ? (
          <EmptyState
            icon={IndianRupee}
            title="No payment history"
            description="Receipts appear here after the office records payments."
          />
        ) : (
          <PaymentHistoryList payments={recentPayments} />
        )}
      </section>

      {/* Emergency + committee — rarely need to leave dashboard */}
      <section className="space-y-3">
        <h2 className="section-title">Need help?</h2>
        <ContactCards contacts={contacts} variant="compact" />
        <a
          href={`tel:${contacts.emergency[0]!.phone.replace(/\s/g, "")}`}
          className="surface-card flex items-center gap-3 p-4 text-sm hover:bg-muted/40"
        >
          <Phone className="h-5 w-5 text-destructive" />
          <div>
            <p className="font-medium">Security desk — 24/7</p>
            <p className="text-muted-foreground">{contacts.emergency[0]!.phone}</p>
          </div>
        </a>
      </section>
    </div>
  );
}

function AtAGlanceCard({
  label,
  value,
  sub,
  icon: Icon,
  tone,
  href,
}: {
  label: string;
  value: string;
  sub: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: "success" | "warning" | "danger" | "neutral";
  href: string;
}) {
  const tones = {
    success: "border-success bg-success",
    warning: "border-warning bg-warning",
    danger: "border-destructive/30 bg-destructive/5",
    neutral: "",
  };

  return (
    <Link
      href={href}
      className={cn(
        "surface-card block p-4 transition-colors hover:border-primary/30",
        tones[tone]
      )}
    >
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="mt-2 text-lg font-semibold tabular-nums">{value}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>
    </Link>
  );
}
