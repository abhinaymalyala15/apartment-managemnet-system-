"use client";

import { useState } from "react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { PageSection } from "@/components/dashboard/page-section";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  formatCurrency,
  formatDate,
  getPaymentStatusVariant,
} from "@/lib/data";
import type {
  Apartment,
  Block,
  Flat,
  Resident,
  Owner,
  FamilyMember,
  Payment,
  Notice,
  Service,
} from "@/types";
import {
  Home,
  Wallet,
  AlertCircle,
  Users,
  Bell,
  Wrench,
  IndianRupee,
  CheckCircle2,
  Calendar,
} from "lucide-react";

interface ResidentDashboardProps {
  apartment: Apartment;
  resident: Resident;
  flat: Flat;
  block: Block;
  owner?: Owner;
  family: FamilyMember[];
  payments: Payment[];
  notices: Notice[];
  services: Service[];
}

export function ResidentDashboard({
  apartment,
  resident,
  flat,
  block,
  owner,
  family,
  payments,
  notices,
  services,
}: ResidentDashboardProps) {
  const [tab, setTab] = useState("overview");

  const pendingPayment = payments.find((p) => p.status === "pending");
  const overduePayment = payments.find((p) => p.status === "overdue");
  const paidThisYear = payments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.amount, 0);
  const recentPayments = payments.filter((p) => p.status === "paid").slice(0, 5);
  const scheduledServices = services.filter((s) => s.status === "scheduled");

  return (
    <>
      <DashboardHeader
        title={`Welcome, ${resident.fullName.split(" ")[0]}`}
        subtitle={`${flat.flatNumber} · ${block.name}`}
        showSearch
      />

      <div className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8">
        {(pendingPayment || overduePayment) && (
          <div
            className={`flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between ${
              overduePayment
                ? "border-destructive/30 bg-destructive/5"
                : "border-amber-500/30 bg-amber-500/5"
            }`}
          >
            <div className="flex items-start gap-3">
              <AlertCircle
                className={`mt-0.5 h-5 w-5 shrink-0 ${
                  overduePayment ? "text-destructive" : "text-amber-600"
                }`}
              />
              <div>
                <p className="font-medium">
                  {overduePayment ? "Overdue maintenance" : "Maintenance due soon"}
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {(overduePayment ?? pendingPayment)?.period} — due{" "}
                  {formatDate((overduePayment ?? pendingPayment)!.dueDate)}
                </p>
              </div>
            </div>
            <p className="text-xl font-semibold sm:text-right">
              {formatCurrency((overduePayment ?? pendingPayment)!.amount)}
            </p>
          </div>
        )}

        <QuickActions onSelect={setTab} />

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto bg-muted/50 p-1">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="notices">Notices</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6 space-y-6">
            <div className="rounded-xl border bg-gradient-to-br from-primary/8 via-card to-card p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{apartment.name}</p>
                  <h2 className="text-2xl font-semibold">Flat {flat.flatNumber}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {block.name} · Floor {flat.floor} · {flat.flatType} ·{" "}
                    {flat.areaSqft} sq.ft
                  </p>
                </div>
                <Badge variant="secondary">Owner Occupied</Badge>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Maintenance Due"
                value={
                  pendingPayment ? formatCurrency(pendingPayment.amount) : "₹0"
                }
                icon={AlertCircle}
              />
              <StatCard
                title="Paid This Year"
                value={formatCurrency(paidThisYear)}
                icon={IndianRupee}
              />
              <StatCard
                title="Family Members"
                value={family.length}
                icon={Users}
              />
              <StatCard
                title="Upcoming Services"
                value={scheduledServices.length}
                icon={Wrench}
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <PageSection title="Flat & Owner" icon={Home} noPadding>
                <dl className="grid gap-4 sm:grid-cols-2">
                  {[
                    ["Block", block.name],
                    ["Flat", flat.flatNumber],
                    ["Owner", owner?.fullName ?? "—"],
                    ["Phone", owner?.phone ?? "—"],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <dt className="text-xs text-muted-foreground">{label}</dt>
                      <dd className="mt-0.5 text-sm font-medium">{value}</dd>
                    </div>
                  ))}
                </dl>
              </PageSection>

              <PageSection title="Family Members" icon={Users} noPadding>
                <ul className="divide-y">
                  {family.map((member) => (
                    <li
                      key={member.id}
                      className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                    >
                      <div>
                        <p className="text-sm font-medium">{member.fullName}</p>
                        <p className="text-xs text-muted-foreground">
                          {member.relationship}
                        </p>
                      </div>
                      {member.phone && (
                        <span className="text-xs text-muted-foreground">
                          {member.phone}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </PageSection>
            </div>
          </TabsContent>

          <TabsContent value="payments" className="mt-6 space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border bg-card p-5 shadow-sm">
                <p className="text-sm text-muted-foreground">Total paid (2025)</p>
                <p className="mt-1 text-2xl font-semibold">
                  {formatCurrency(paidThisYear)}
                </p>
              </div>
              <div className="flex items-center gap-3 rounded-xl border bg-emerald-500/5 p-5 shadow-sm">
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                <div>
                  <p className="text-sm font-medium">Last payment</p>
                  <p className="text-lg font-semibold">
                    {recentPayments[0]
                      ? formatCurrency(recentPayments[0].amount)
                      : "—"}
                  </p>
                </div>
              </div>
            </div>

            <PageSection title="Payment History" icon={Wallet} noPadding>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Period</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Receipt</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{payment.period}</TableCell>
                      <TableCell>{formatCurrency(payment.amount)}</TableCell>
                      <TableCell>
                        <Badge variant={getPaymentStatusVariant(payment.status)}>
                          {payment.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {payment.receiptNumber ?? "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </PageSection>
          </TabsContent>

          <TabsContent value="notices" className="mt-6">
            <PageSection title="Society Notices" icon={Bell} noPadding>
              <div className="divide-y">
                {notices.map((notice) => (
                  <article key={notice.id} className="px-5 py-4 sm:px-6">
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="font-medium">{notice.title}</h4>
                      <Badge
                        variant={
                          notice.priority === "high" ? "destructive" : "secondary"
                        }
                        className="shrink-0 text-xs"
                      >
                        {notice.priority}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {notice.content}
                    </p>
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {formatDate(notice.publishedAt)} · {notice.category}
                    </p>
                  </article>
                ))}
              </div>
            </PageSection>
          </TabsContent>

          <TabsContent value="services" className="mt-6">
            <PageSection
              title="Service Schedule"
              description="Upcoming maintenance for your flat and society"
              icon={Wrench}
              noPadding
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Vendor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scheduledServices.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell className="font-medium">{service.title}</TableCell>
                      <TableCell>{service.serviceType}</TableCell>
                      <TableCell>{formatDate(service.scheduledDate)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {service.vendor}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </PageSection>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
