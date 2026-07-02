"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  Download,
  Mail,
  Phone,
  Printer,
  Wallet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ActivityTimeline } from "@/components/shared/activity-timeline";
import { FlatStatusDot } from "@/components/inspector/explorer/flat-status-dot";
import { FlatOpsSection, FlatOpsField } from "@/components/inspector/flat/flat-ops-section";
import { FlatOpsProvider, useFlatOps } from "@/components/inspector/flat/flat-ops-provider";
import { FlatOpsDrawers } from "@/components/inspector/flat/flat-ops-drawers";
import {
  formatCurrency,
  formatDate,
  getOccupancyVariant,
  getPaymentStatusLabel,
  getPaymentStatusVariant,
  getPaymentTypeLabel,
} from "@/lib/data";
import {
  formatDateTime,
  getContactMethodLabel,
  getFollowUpStatusLabel,
} from "@/lib/admin-data";
import type { FlatOperationsData, FlatTimelineEvent, Payment } from "@/types";
import { cn } from "@/lib/utils";
import { routes } from "@/config/routes";
import {
  Users,
  UserCircle,
  FileText,
  History,
  StickyNote,
  MessageSquare,
  ClipboardList,
  Link2,
  Home,
} from "lucide-react";

const TIMELINE_FILTERS: Array<{ id: "all" | FlatTimelineEvent["type"]; label: string }> = [
  { id: "all", label: "All" },
  { id: "payment", label: "Payments" },
  { id: "occupancy", label: "Occupancy" },
  { id: "document", label: "Documents" },
  { id: "follow_up", label: "Follow-ups" },
  { id: "communication", label: "Comms" },
  { id: "service", label: "Services" },
  { id: "notice", label: "Notices" },
];

interface FlatOperationsHubProps {
  data: FlatOperationsData;
}

export function FlatOperationsHub({ data }: FlatOperationsHubProps) {
  return (
    <FlatOpsProvider flatId={data.flatId} flatNumber={data.flatNumber}>
      <FlatOperationsHubContent data={data} />
      <FlatOpsDrawers data={data} />
    </FlatOpsProvider>
  );
}

function FlatOperationsHubContent({ data }: FlatOperationsHubProps) {
  return (
    <div className="pb-24 lg:pb-8">
      <Link
        href={`/inspector/blocks/${data.blockId}/floors/${data.floor}`}
        className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        Floor {data.floor} · {data.blockName}
      </Link>

      <header className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold tabular-nums tracking-tight">
              Flat {data.flatNumber}
            </h1>
            <FlatStatusDot status={data.billStatus} showLabel />
            <Badge variant={getOccupancyVariant(data.occupancyStatus)}>
              {data.occupancyLabel}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Flat Operations Hub · {data.apartmentName}
          </p>
        </div>
      </header>

      <FlatOpsStickyBar data={data} />

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <div className="space-y-6">
          <FlatSummarySection data={data} />
          <OwnerSection data={data} />
          <TenantSection data={data} />
          <FamilySection data={data} />
        </div>

        <div className="space-y-6">
          <MaintenanceSection data={data} />
          <TimelineSection data={data} />
          <DocumentsSection data={data} />
          <NotesSection data={data} />
          <CommunicationSection data={data} />
          <FollowUpSection data={data} />
        </div>
      </div>

      <div className="mt-6">
        <RelatedItemsSection data={data} />
      </div>
    </div>
  );
}

function FlatOpsStickyBar({ data }: { data: FlatOperationsData }) {
  const { openAction } = useFlatOps();

  return (
    <div className="sticky top-[7.5rem] z-30 -mx-4 mt-4 border-y bg-background/95 px-4 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/90 lg:top-36 lg:mx-0 lg:rounded-xl lg:border lg:shadow-sm">
      <div className="flex flex-wrap gap-2">
        <Button size="sm" className="h-9 gap-1.5" onClick={() => openAction("record-payment")}>
          <Wallet className="h-4 w-4" />
          Record payment
        </Button>
        {data.residentPhone && (
          <a
            href={`tel:${data.residentPhone.replace(/\s/g, "")}`}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-background px-3 text-sm font-medium hover:bg-muted"
          >
            <Phone className="h-4 w-4" />
            Call resident
          </a>
        )}
        <Button
          size="sm"
          variant="outline"
          className="h-9 gap-1.5"
          onClick={() => openAction("print-statement")}
        >
          <Printer className="h-4 w-4" />
          Print statement
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-9 gap-1.5"
          onClick={() => openAction("download-statement")}
        >
          <Download className="h-4 w-4" />
          Download
        </Button>
      </div>
    </div>
  );
}

function FlatSummarySection({ data }: { data: FlatOperationsData }) {
  return (
    <FlatOpsSection id="summary" title="Flat summary" description="Identity and billing status">
      <dl className="grid gap-4 sm:grid-cols-2">
        <FlatOpsField label="Apartment" value={data.apartmentName} />
        <FlatOpsField label="Block" value={data.blockName} />
        <FlatOpsField label="Floor" value={data.floor} />
        <FlatOpsField label="Flat number" value={data.flatNumber} />
        <FlatOpsField label="Flat type" value={data.flatType} />
        <FlatOpsField label="Area" value={`${data.areaSqft} sq.ft`} />
        <FlatOpsField label="Bedrooms" value={data.bedrooms} />
        <FlatOpsField label="Parking slots" value={data.parkingSlots ?? 0} />
        <FlatOpsField label="Occupancy" value={data.occupancyLabel} />
        <FlatOpsField
          label="Maintenance status"
          value={
            <span className="inline-flex items-center gap-2 capitalize">
              <FlatStatusDot status={data.billStatus} />
              {data.billStatus === "pending" ? "Due soon" : data.billStatus}
            </span>
          }
        />
      </dl>
    </FlatOpsSection>
  );
}

function OwnerSection({ data }: { data: FlatOperationsData }) {
  const { openAction } = useFlatOps();
  const owner = data.owner;

  return (
    <FlatOpsSection
      id="owner"
      title="Owner information"
      actions={
        owner ? (
          <>
            <Button size="sm" variant="outline" onClick={() => openAction("edit-owner")}>
              Edit owner
            </Button>
            <Button size="sm" variant="outline" onClick={() => openAction("replace-owner")}>
              Replace owner
            </Button>
          </>
        ) : undefined
      }
    >
      {!owner ? (
        <EmptyState
          icon={UserCircle}
          title="No owner on record"
          description="Register the primary owner for this flat."
          className="py-6"
        />
      ) : (
        <dl className="grid gap-4 sm:grid-cols-2">
          <FlatOpsField label="Name" value={owner.fullName} />
          <FlatOpsField
            label="Mobile"
            value={
              <a href={`tel:${owner.phone.replace(/\s/g, "")}`} className="text-primary hover:underline">
                {owner.phone}
              </a>
            }
          />
          <FlatOpsField
            label="Email"
            value={
              <a href={`mailto:${owner.email}`} className="text-primary hover:underline">
                {owner.email}
              </a>
            }
          />
          <FlatOpsField label="Aadhaar / ID" value={owner.aadhaarMasked} />
          <FlatOpsField
            label="Ownership since"
            value={formatDate(owner.ownershipStartDate)}
          />
        </dl>
      )}
    </FlatOpsSection>
  );
}

function TenantSection({ data }: { data: FlatOperationsData }) {
  const { openAction } = useFlatOps();
  const tenant = data.tenant;
  const vacant = data.occupancyStatus === "vacant";

  return (
    <FlatOpsSection
      id="tenant"
      title="Tenant information"
      actions={
        <>
          <Button size="sm" variant="outline" onClick={() => openAction("add-tenant")}>
            Add tenant
          </Button>
          {tenant && (
            <>
              <Button size="sm" variant="outline" onClick={() => openAction("replace-tenant")}>
                Replace tenant
              </Button>
              <Button size="sm" variant="outline" onClick={() => openAction("end-tenancy")}>
                End tenancy
              </Button>
            </>
          )}
        </>
      }
    >
      {vacant || !tenant ? (
        <EmptyState
          icon={Home}
          title={vacant ? "Flat is vacant" : "No active tenant"}
          description={
            vacant
              ? "No tenant or owner-resident currently occupying this flat."
              : "Owner-occupied — no separate tenant on record."
          }
          className="py-6"
        />
      ) : (
        <dl className="grid gap-4 sm:grid-cols-2">
          <FlatOpsField label="Name" value={tenant.fullName} />
          <FlatOpsField
            label="Mobile"
            value={
              <a href={`tel:${tenant.phone.replace(/\s/g, "")}`} className="text-primary hover:underline">
                {tenant.phone}
              </a>
            }
          />
          <FlatOpsField label="Email" value={tenant.email} />
          <FlatOpsField label="Lease start" value={formatDate(tenant.leaseStartDate)} />
          <FlatOpsField label="Lease end" value={formatDate(tenant.leaseEndDate)} />
        </dl>
      )}
    </FlatOpsSection>
  );
}

function FamilySection({ data }: { data: FlatOperationsData }) {
  const { openAction } = useFlatOps();

  return (
    <FlatOpsSection
      id="family"
      title="Family members"
      description={`${data.family.length} on record`}
      actions={
        <Button size="sm" variant="outline" onClick={() => openAction("add-family")}>
          Add member
        </Button>
      }
    >
      {data.family.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No family members"
          description="Register household members for emergency contact and society records."
          className="py-6"
        />
      ) : (
        <ul className="divide-y">
          {data.family.map((member) => (
            <li key={member.id} className="flex flex-wrap items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
              <div>
                <p className="font-medium">{member.fullName}</p>
                <p className="text-sm text-muted-foreground">{member.relationship}</p>
                <div className="mt-1 flex flex-wrap gap-3 text-sm">
                  {member.phone && (
                    <a href={`tel:${member.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-1 text-primary hover:underline">
                      <Phone className="h-3 w-3" />
                      {member.phone}
                    </a>
                  )}
                  {member.email && (
                    <a href={`mailto:${member.email}`} className="inline-flex items-center gap-1 text-muted-foreground hover:underline">
                      <Mail className="h-3 w-3" />
                      {member.email}
                    </a>
                  )}
                </div>
              </div>
              <div className="text-right text-xs text-muted-foreground">
                {member.age != null && <p>Age {member.age}</p>}
                {member.isEmergencyContact && (
                  <Badge variant="outline" className="mt-1 text-[10px]">
                    Emergency
                  </Badge>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  className="mt-1 h-7 text-xs"
                  onClick={() => openAction("edit-family")}
                >
                  Edit
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </FlatOpsSection>
  );
}

function MaintenanceSection({ data }: { data: FlatOperationsData }) {
  const { openAction } = useFlatOps();
  const m = data.maintenance;

  return (
    <FlatOpsSection
      id="maintenance"
      title="Maintenance"
      description="Bills, payments, and receipts"
      actions={
        <>
          <Button size="sm" onClick={() => openAction("record-payment")}>
            Record payment
          </Button>
          <Button size="sm" variant="outline" onClick={() => openAction("print-receipt")}>
            Print receipt
          </Button>
        </>
      }
    >
      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-muted/20 p-3">
          <p className="text-xs text-muted-foreground">Outstanding</p>
          <p className={cn("text-lg font-semibold tabular-nums", m.outstanding > 0 && "text-destructive")}>
            {formatCurrency(m.outstanding)}
          </p>
        </div>
        <div className="rounded-lg border bg-muted/20 p-3">
          <p className="text-xs text-muted-foreground">Current bill</p>
          <p className="text-sm font-medium">
            {m.currentBill ? `${m.currentBill.period} · ${formatCurrency(m.currentBill.amount)}` : "None open"}
          </p>
          {m.currentBill && (
            <p className="text-xs text-muted-foreground">Due {formatDate(m.currentBill.dueDate)}</p>
          )}
        </div>
        <div className="rounded-lg border bg-muted/20 p-3">
          <p className="text-xs text-muted-foreground">Last payment</p>
          <p className="text-sm font-medium">
            {m.lastPayment
              ? `${formatCurrency(m.lastPayment.amount)} · ${formatDate(m.lastPayment.paidDate)}`
              : "—"}
          </p>
        </div>
        <div className="rounded-lg border bg-muted/20 p-3">
          <p className="text-xs text-muted-foreground">Status</p>
          <Badge
            variant={
              m.paymentStatus === "overdue"
                ? "destructive"
                : m.paymentStatus === "pending"
                  ? "secondary"
                  : "default"
            }
            className="mt-1"
          >
            {m.paymentStatus === "vacant" ? "Vacant" : getPaymentStatusLabel(m.paymentStatus)}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="bills">
        <TabsList variant="line" className="scroll-tabs w-full justify-start border-0">
          <TabsTrigger value="bills">Bills ({m.bills.length})</TabsTrigger>
          <TabsTrigger value="payments">Payments ({m.payments.length})</TabsTrigger>
          <TabsTrigger value="receipts">Receipts ({m.receipts.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="bills" className="mt-3">
          <PaymentList items={m.bills} mode="bill" />
        </TabsContent>
        <TabsContent value="payments" className="mt-3">
          <PaymentList items={m.payments} mode="paid" />
        </TabsContent>
        <TabsContent value="receipts" className="mt-3">
          <PaymentList items={m.receipts} mode="receipt" />
        </TabsContent>
      </Tabs>
    </FlatOpsSection>
  );
}

function PaymentList({
  items,
  mode,
}: {
  items: Payment[];
  mode: "bill" | "paid" | "receipt";
}) {
  if (items.length === 0) {
    return (
      <p className="py-4 text-sm text-muted-foreground">
        No {mode === "bill" ? "open bills" : mode === "paid" ? "payments" : "receipts"} on record.
      </p>
    );
  }

  return (
    <ul className="max-h-64 divide-y overflow-y-auto">
      {items.slice(0, 12).map((item) => (
        <li key={item.id} className="flex items-center justify-between py-2.5 text-sm">
          <div>
            <p className="font-medium">{item.period}</p>
            <p className="text-xs text-muted-foreground">
              {getPaymentTypeLabel(item.type)}
              {mode === "paid" && item.paidDate && ` · Paid ${formatDate(item.paidDate)}`}
              {mode === "bill" && ` · Due ${formatDate(item.dueDate)}`}
              {item.receiptNumber && ` · ${item.receiptNumber}`}
            </p>
          </div>
          <div className="text-right">
            <p className="font-semibold tabular-nums">{formatCurrency(item.amount)}</p>
            {mode === "bill" && (
              <Badge variant={getPaymentStatusVariant(item.status)} className="text-[10px]">
                {getPaymentStatusLabel(item.status)}
              </Badge>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

function TimelineSection({ data }: { data: FlatOperationsData }) {
  const [filter, setFilter] = useState<"all" | FlatTimelineEvent["type"]>("all");

  const filtered = useMemo(() => {
    if (filter === "all") return data.timeline;
    return data.timeline.filter((e) => e.type === filter);
  }, [data.timeline, filter]);

  return (
    <FlatOpsSection
      id="timeline"
      title="Timeline"
      description="Everything that happened to this flat"
    >
      <div className="scroll-row mb-4 flex-wrap gap-1.5 sm:flex-wrap">
        {TIMELINE_FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={cn(
              "rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
              filter === f.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>
      <div className="pl-1">
        <ActivityTimeline events={filtered} compact limit={20} />
      </div>
    </FlatOpsSection>
  );
}

function DocumentsSection({ data }: { data: FlatOperationsData }) {
  const { openAction } = useFlatOps();

  return (
    <FlatOpsSection
      id="documents"
      title="Documents"
      actions={
        <Button size="sm" variant="outline" onClick={() => openAction("upload-document")}>
          Upload
        </Button>
      }
    >
      {data.documents.length === 0 ? (
        <EmptyState icon={FileText} title="No documents" description="Upload sale deed, agreements, and receipts." className="py-6" />
      ) : (
        <ul className="divide-y">
          {data.documents.map((doc) => (
            <li key={doc.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
              <div>
                <p className="font-medium">{doc.title}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {doc.category} · {formatDate(doc.uploadedAt)} · {doc.fileLabel}
                </p>
              </div>
              <Button size="sm" variant="outline" className="h-8 text-xs">
                Download
              </Button>
            </li>
          ))}
        </ul>
      )}
    </FlatOpsSection>
  );
}

function NotesSection({ data }: { data: FlatOperationsData }) {
  return (
    <FlatOpsSection
      id="notes"
      title="Internal notes"
      description="Admin only — never visible to residents"
    >
      {data.internalNotes.length === 0 ? (
        <EmptyState
          icon={StickyNote}
          title="No internal notes"
          description="Office staff can add private notes about this household."
          className="py-6"
        />
      ) : (
        <ul className="space-y-3">
          {data.internalNotes.map((note) => (
            <li key={note.id} className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
              <p className="text-sm">{note.content}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                {note.author} · {formatDateTime(note.createdAt)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </FlatOpsSection>
  );
}

function CommunicationSection({ data }: { data: FlatOperationsData }) {
  const channelLabels = {
    phone: "Call",
    sms: "SMS",
    email: "Email",
    whatsapp: "WhatsApp",
  };

  return (
    <FlatOpsSection id="communication" title="Communication history" description="Calls, messages, and emails">
      {data.communications.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No communications logged"
          description="Contact history will appear here as staff log calls and messages."
          className="py-6"
        />
      ) : (
        <ul className="divide-y">
          {data.communications.map((comm) => (
            <li key={comm.id} className="py-3 first:pt-0 last:pb-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium">
                    {channelLabels[comm.channel]} · {comm.contactName}
                  </p>
                  <p className="text-sm text-muted-foreground">{comm.summary}</p>
                </div>
                <Badge variant="outline" className="shrink-0 text-[10px] capitalize">
                  {comm.direction}
                </Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {formatDateTime(comm.occurredAt)} · {comm.staffName}
              </p>
            </li>
          ))}
        </ul>
      )}
    </FlatOpsSection>
  );
}

function FollowUpSection({ data }: { data: FlatOperationsData }) {
  const { openAction } = useFlatOps();
  const fu = data.followUp;

  return (
    <FlatOpsSection
      id="follow-up"
      title="Follow-up"
      description="Payment follow-up mini CRM"
      actions={
        fu ? (
          <>
            {fu.residentPhone && (
              <a
                href={`tel:${fu.residentPhone.replace(/\s/g, "")}`}
                className="inline-flex h-8 items-center rounded-lg border px-3 text-xs font-medium hover:bg-muted"
              >
                Call
              </a>
            )}
            <Button size="sm" variant="outline" onClick={() => openAction("log-follow-up")}>
              Log follow-up
            </Button>
            <Button size="sm" onClick={() => openAction("record-payment")}>
              Record payment
            </Button>
          </>
        ) : undefined
      }
    >
      {!fu ? (
        <EmptyState
          icon={ClipboardList}
          title="No active follow-up"
          description="Follow-ups are created when bills become overdue."
          className="py-6"
        />
      ) : (
        <dl className="grid gap-3 sm:grid-cols-2">
          <FlatOpsField label="Outstanding" value={formatCurrency(fu.amountPending)} />
          <FlatOpsField label="Days overdue" value={`${fu.daysOverdue} days`} />
          <FlatOpsField
            label="Last contact"
            value={`${getContactMethodLabel(fu.lastContactMethod)} · ${formatDateTime(fu.lastContactAt)}`}
          />
          <FlatOpsField label="Promise / outcome" value={fu.lastOutcome} />
          <FlatOpsField label="Next follow-up" value={formatDate(fu.nextFollowUpDate)} />
          <FlatOpsField label="Status" value={getFollowUpStatusLabel(fu.status)} />
        </dl>
      )}
    </FlatOpsSection>
  );
}

function RelatedItemsSection({ data }: { data: FlatOperationsData }) {
  const links = [
    { href: "#maintenance", label: "Bills & payments", icon: Wallet },
    { href: "#timeline", label: "Timeline", icon: History },
    { href: "#documents", label: "Documents", icon: FileText },
    { href: "#communication", label: "Communication", icon: MessageSquare },
    {
      href: routes.dashboard.inspector.maintenance.outstanding,
      label: "Outstanding queue",
      icon: Wallet,
      external: true,
    },
    {
      href: routes.dashboard.inspector.complaints.open,
      label: "Complaints",
      icon: ClipboardList,
      external: true,
    },
    {
      href: routes.dashboard.inspector.visitors.root,
      label: "Visitors",
      icon: Users,
      external: true,
    },
    {
      href: routes.dashboard.inspector.notices.published,
      label: "Notices",
      icon: MessageSquare,
      external: true,
    },
    {
      href: `/inspector/blocks/${data.blockId}`,
      label: "Block view",
      icon: Link2,
      external: true,
    },
    {
      href: `/inspector/blocks/${data.blockId}/floors/${data.floor}`,
      label: "Floor view",
      icon: Link2,
      external: true,
    },
  ];

  return (
    <FlatOpsSection id="related" title="Related items" description="Connected areas for this household">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {links.map((link) => {
          const Icon = link.icon;
          const href = link.external ? link.href : link.href;
          return (
            <Link
              key={link.label}
              href={href}
              className="flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted/50"
            >
              <Icon className="h-4 w-4 text-primary" />
              {link.label}
            </Link>
          );
        })}
      </div>
    </FlatOpsSection>
  );
}
