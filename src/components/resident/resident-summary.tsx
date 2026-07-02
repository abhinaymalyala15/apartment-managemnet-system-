import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Phone,
  FileText,
  Users,
  Home,
  Wallet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button-link";
import { ActivityTimeline } from "@/components/shared/activity-timeline";
import { ContactCards } from "@/components/shared/contact-cards";
import { ResidentInfoList } from "@/components/resident/resident-info-list";
import { ResidentSection } from "@/components/resident/resident-section";
import {
  formatCurrency,
  formatDate,
  getCommitteeContacts,
  getDocuments,
  getLastPaidPayment,
  getMonthlyMaintenanceCharge,
  getPaymentStatusLabel,
  getResidentTimeline,
  getResidentTypeLabel,
} from "@/lib/data";
import type { FamilyMember, Flat, Block, Owner, Payment, Resident } from "@/types";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";

const root = routes.dashboard.resident.root;

interface ResidentSummaryProps {
  resident: Resident;
  flat: Flat;
  block: Block;
  owner?: Owner;
  family: FamilyMember[];
  payments: Payment[];
}

export function ResidentSummary({
  resident,
  flat,
  block,
  owner,
  family,
  payments,
}: ResidentSummaryProps) {
  const contacts = getCommitteeContacts();
  const monthlyCharge = getMonthlyMaintenanceCharge(flat);
  const lastPaid = getLastPaidPayment(payments);
  const overdue = payments.find((p) => p.status === "overdue");
  const pending = payments.find((p) => p.status === "pending");
  const dueBill = overdue ?? pending;
  const docs = getDocuments(flat.id);
  const timeline = getResidentTimeline(flat.id);

  const initials = resident.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  const allMembers = [
    { name: resident.fullName, role: "You · primary resident" },
    ...family.map((m) => ({ name: m.fullName, role: m.relationship })),
  ];

  return (
    <div className="page-stack">
      {/* Summary header */}
      <section className="surface-card bg-gradient-to-br from-primary/8 via-card to-card p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary text-lg font-semibold text-primary-foreground">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-semibold">{resident.fullName}</h2>
            <p className="text-sm text-muted-foreground">
              Flat {flat.flatNumber} · {block.name} · Floor {flat.floor}
            </p>
            <Badge variant="secondary" className="mt-2">
              {getResidentTypeLabel(flat.occupancyStatus)}
            </Badge>
          </div>
        </div>
      </section>

      {/* Maintenance status + last payment — connected to flat */}
      <section className="grid gap-3 sm:grid-cols-2">
        <div
          className={cn(
            "surface-card p-4",
            dueBill
              ? overdue
                ? "border-destructive/30 bg-destructive/5"
                : "border-warning bg-warning"
              : "border-success bg-success"
          )}
        >
          <div className="flex items-center gap-2">
            {dueBill ? (
              overdue ? (
                <AlertCircle className="h-5 w-5 text-destructive" />
              ) : (
                <Clock className="h-5 w-5 text-warning-foreground" />
              )
            ) : (
              <CheckCircle2 className="h-5 w-5 text-success" />
            )}
            <span className="text-sm font-medium">Maintenance status</span>
          </div>
          <p className="mt-2 text-lg font-semibold">
            {dueBill
              ? `${getPaymentStatusLabel(dueBill.status)} · ${formatCurrency(dueBill.amount)}`
              : "All paid"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {formatCurrency(monthlyCharge)}/month ·{" "}
            <Link href={`${root}/payments`} className="text-primary hover:underline">
              View bills →
            </Link>
          </p>
        </div>

        <div className="surface-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Wallet className="h-5 w-5" />
            <span className="text-sm font-medium">Last payment</span>
          </div>
          {lastPaid ? (
            <>
              <p className="mt-2 text-lg font-semibold tabular-nums">
                {formatCurrency(lastPaid.amount)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {lastPaid.period} · paid {lastPaid.paidDate ? formatDate(lastPaid.paidDate) : "—"}
              </p>
            </>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">No payments on record</p>
          )}
        </div>
      </section>

      {/* Owner + flat — one glance */}
      <ResidentSection title="Owner & flat">
        <ResidentInfoList
          items={[
            { label: "Owner", value: owner?.fullName ?? resident.fullName },
            { label: "Flat", value: `${flat.flatNumber} · ${block.name}` },
            { label: "Size", value: `${flat.areaSqft} sq.ft · ${flat.flatType}` },
            {
              label: "Phone",
              value: (
                <a href={`tel:${resident.phone.replace(/\s/g, "")}`} className="text-primary hover:underline">
                  {resident.phone}
                </a>
              ),
            },
          ]}
        />
        <ButtonLink href={`${root}/flat`} variant="outline" size="sm" className="mt-3 gap-1.5">
          <Home className="h-4 w-4" />
          Full flat details
        </ButtonLink>
      </ResidentSection>

      {/* Family members inline */}
      <ResidentSection title="Household members">
        <ul className="surface-card divide-y">
          {allMembers.map((member) => (
            <li key={member.name} className="flex items-center justify-between px-4 py-3 text-sm">
              <span className="font-medium">{member.name}</span>
              <span className="text-muted-foreground">{member.role}</span>
            </li>
          ))}
        </ul>
        <ButtonLink href={`${root}/family`} variant="outline" size="sm" className="mt-3 gap-1.5">
          <Users className="h-4 w-4" />
          View all members
        </ButtonLink>
      </ResidentSection>

      {/* Emergency — tap to call */}
      <ResidentSection title="Emergency contact">
        <a
          href={`tel:${contacts.emergency[0]!.phone.replace(/\s/g, "")}`}
          className="surface-card flex items-center gap-4 p-4 hover:bg-muted/40"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
            <Phone className="h-6 w-6 text-destructive" />
          </div>
          <div>
            <p className="font-medium">{contacts.emergency[0]!.label}</p>
            <p className="text-lg font-semibold text-primary">{contacts.emergency[0]!.phone}</p>
            <p className="text-xs text-muted-foreground">{contacts.emergency[0]!.hours}</p>
          </div>
        </a>
      </ResidentSection>

      {/* Documents */}
      <ResidentSection title="Documents">
        {docs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No documents on file.</p>
        ) : (
          <ul className="surface-card divide-y">
            {docs.map((doc) => (
              <li key={doc.id} className="flex items-center gap-3 px-4 py-3.5">
                <FileText className="h-5 w-5 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{doc.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {doc.fileLabel} · {formatDate(doc.uploadedAt)}
                  </p>
                </div>
                <Badge variant="outline" className="shrink-0 text-[10px] capitalize">
                  {doc.category}
                </Badge>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-2 text-xs text-muted-foreground">
          Demo — downloads will be available when the society office connects document storage.
        </p>
      </ResidentSection>

      {/* Timeline — everything connected */}
      <ResidentSection title="Flat activity timeline">
        <p className="mb-4 text-sm text-muted-foreground">
          Bills, notices, visits, and household updates for Flat {flat.flatNumber}.
        </p>
        <ActivityTimeline events={timeline} limit={8} />
        <ButtonLink href={`${root}/timeline`} variant="ghost" size="sm" className="mt-4">
          View full timeline →
        </ButtonLink>
      </ResidentSection>

      {/* Committee */}
      <ResidentSection title="Society committee">
        <ContactCards contacts={contacts} variant="full" />
      </ResidentSection>
    </div>
  );
}
