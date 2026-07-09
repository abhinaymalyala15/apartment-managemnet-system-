/**
 * Demo data access layer.
 * All data is loaded from JSON files — no API calls.
 * Will be replaced by API client in backend integration phase.
 */
import apartmentData from "@/data/apartment.json";
import blocksData from "@/data/blocks.json";
import flatsData from "@/data/flats.json";
import residentsData from "@/data/residents.json";
import ownersData from "@/data/owners.json";
import tenantsData from "@/data/tenants.json";
import familyMembersData from "@/data/family-members.json";
import paymentsData from "@/data/payments.json";
import noticesData from "@/data/notices.json";
import servicesData from "@/data/services.json";
import galleryData from "@/data/gallery.json";
import maintenanceSummaryData from "@/data/maintenance-summary.json";
import committeeContactsData from "@/data/committee-contacts.json";
import documentsData from "@/data/documents.json";

import demoUsersData from "@/data/demo-users.json";
import { listStoredPublished } from "@/lib/communication-storage";

import type {
  Apartment,
  Block,
  Flat,
  Resident,
  Owner,
  Tenant,
  FamilyMember,
  Payment,
  Notice,
  Service,
  GalleryImage,
  MaintenanceSummary,
  OccupancyStatus,
  DemoUser,
  CommitteeContacts,
  FlatTimelineEvent,
  ResidentDocument,
} from "@/types";

export const DEMO_RESIDENT_ID = "resident-srinivas";

/** Fixed reference date so demo content stays meaningful regardless of system clock */
export const DEMO_REFERENCE_DATE = "2025-07-02";

export function getDemoToday(): Date {
  return new Date(DEMO_REFERENCE_DATE);
}

export function getDemoTodayIso(): string {
  return DEMO_REFERENCE_DATE;
}

export function getCurrentYear(): number {
  return getDemoToday().getFullYear();
}

interface DemoUsersFile {
  resident: DemoUser;
  inspector: DemoUser;
  admin: DemoUser;
  platform: DemoUser;
}

const demoUsers = demoUsersData as DemoUsersFile;

const apartment = apartmentData as Apartment;
const blocks = blocksData as Block[];
const flats = flatsData as Flat[];
const residents = residentsData as Resident[];
const owners = ownersData as Owner[];
const tenants = tenantsData as Tenant[];
const familyMembers = familyMembersData as FamilyMember[];
const payments = paymentsData as Payment[];
const notices = noticesData as Notice[];
const services = servicesData as Service[];
const gallery = galleryData as GalleryImage[];
const maintenanceSummary = maintenanceSummaryData as MaintenanceSummary;
const committeeContacts = committeeContactsData as CommitteeContacts;
const documents = documentsData as ResidentDocument[];

export function getApartment(): Apartment {
  return apartment;
}

export function getBlocks(): Block[] {
  return blocks;
}

export function getBlockById(id: string): Block | undefined {
  return blocks.find((b) => b.id === id);
}

export function getFlats(): Flat[] {
  return flats;
}

export function getFlatsByBlock(blockId: string): Flat[] {
  return flats.filter((f) => f.blockId === blockId);
}

export function getFlatById(id: string): Flat | undefined {
  return flats.find((f) => f.id === id);
}

export function getResident(): Resident {
  return residents.find((r) => r.id === DEMO_RESIDENT_ID)!;
}

export function getResidentById(id: string): Resident | undefined {
  return residents.find((r) => r.id === id);
}

export function getDemoUsers(): DemoUsersFile {
  return demoUsers;
}

export function getDemoUser(role: keyof DemoUsersFile): DemoUser {
  return demoUsers[role];
}

export function getFlatByNumber(flatNumber: string): Flat | undefined {
  return flats.find((f) => f.flatNumber === flatNumber);
}

export function getOwnersByFlat(flatId: string): Owner[] {
  return owners.filter((o) => o.flatId === flatId);
}

export function getTenantsByFlat(flatId: string): Tenant[] {
  return tenants.filter((t) => t.flatId === flatId && t.isActive);
}

export function getAllTenants(): Tenant[] {
  return tenants;
}

export function getFamilyByFlat(flatId: string): FamilyMember[] {
  return familyMembers.filter((f) => f.flatId === flatId);
}

export function getPaymentsByFlat(flatId: string): Payment[] {
  return payments
    .filter((p) => p.flatId === flatId)
    .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
}

export function getPayments(): Payment[] {
  return payments;
}

export function getPaymentsRecordedOn(dateIso: string): Payment[] {
  return payments.filter((p) => p.status === "paid" && p.paidDate === dateIso);
}

export function getNotices(): Notice[] {
  const merged = [...listStoredPublished(), ...notices];
  const seen = new Set<string>();
  const unique = merged.filter((n) => {
    if (seen.has(n.id)) return false;
    seen.add(n.id);
    return true;
  });
  return unique.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

export function getServices(flatId?: string): Service[] {
  const filtered = flatId
    ? services.filter((s) => !s.flatId || s.flatId === flatId)
    : services;
  return [...filtered].sort(
    (a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
  );
}

export function getGallery(): GalleryImage[] {
  return gallery;
}

export function getMaintenanceSummary(): MaintenanceSummary {
  return maintenanceSummary;
}

export function getCommitteeContacts(): CommitteeContacts {
  return committeeContacts;
}

export function getMonthlyMaintenanceCharge(flat?: Flat): number {
  const summary = getMaintenanceSummary();
  if (flat && summary.maintenanceRatePerSqft) {
    return Math.round(summary.maintenanceRatePerSqft * flat.areaSqft);
  }
  return summary.monthlyMaintenancePerFlat ?? 1300;
}

export function getPaymentTypeLabel(type: Payment["type"]): string {
  const labels: Record<Payment["type"], string> = {
    maintenance: "Maintenance",
    penalty: "Penalty",
    special_levy: "Special levy",
  };
  return labels[type];
}

export function getNoticeCategoryLabel(category: Notice["category"]): string {
  const labels: Record<Notice["category"], string> = {
    general: "General",
    maintenance: "Maintenance",
    event: "Event",
    emergency: "Emergency",
  };
  return labels[category];
}

export function getNoticePriorityLabel(priority: Notice["priority"]): string {
  const labels: Record<Notice["priority"], string> = {
    low: "Info",
    medium: "Update",
    high: "Important",
  };
  return labels[priority];
}

export function isServiceToday(service: Service): boolean {
  return service.scheduledDate === getDemoTodayIso();
}

export function isServiceThisWeek(service: Service): boolean {
  const today = getDemoToday();
  const start = new Date(today);
  start.setDate(today.getDate() - today.getDay());
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const date = new Date(service.scheduledDate);
  return date >= start && date <= end;
}

export function isServiceUpcoming(service: Service): boolean {
  return (
    service.status === "scheduled" &&
    service.scheduledDate >= getDemoTodayIso()
  );
}

export function getNextPaymentDueDate(payments: Payment[]): string | null {
  const open = payments
    .filter((p) => p.status === "pending" || p.status === "overdue")
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  return open[0]?.dueDate ?? null;
}

export function getPaidThisYearTotal(payments: Payment[]): number {
  const year = getCurrentYear();
  return payments
    .filter((p) => p.status === "paid" && p.paidDate?.startsWith(String(year)))
    .reduce((sum, p) => sum + p.amount, 0);
}

export function getLastPaidPayment(payments: Payment[]): Payment | undefined {
  return payments.find((p) => p.status === "paid" && p.paidDate);
}

export function getDocuments(flatId?: string): ResidentDocument[] {
  return documents.filter(
    (d) => !d.flatId || d.flatId === flatId
  );
}

export function getResidentTimeline(flatId: string): FlatTimelineEvent[] {
  const root = "/resident";
  const events: FlatTimelineEvent[] = [];

  for (const notice of getNotices()) {
    events.push({
      id: `notice-${notice.id}`,
      date: notice.publishedAt,
      title: notice.title,
      description: getNoticeCategoryLabel(notice.category),
      type: "notice",
      href: `${root}/notices`,
    });
  }

  for (const payment of getPaymentsByFlat(flatId)) {
    if (payment.status === "paid" && payment.paidDate) {
      events.push({
        id: `pay-${payment.id}`,
        date: payment.paidDate,
        title: `Maintenance paid — ${payment.period}`,
        description: `${formatCurrency(payment.amount)} · ${payment.receiptNumber ?? "Receipt on file"}`,
        type: "payment",
        href: `${root}/payments`,
      });
    } else if (payment.status !== "paid") {
      events.push({
        id: `due-${payment.id}`,
        date: payment.dueDate,
        title: `${payment.period} — ${getPaymentStatusLabel(payment.status)}`,
        description: `${formatCurrency(payment.amount)} due`,
        type: "payment",
        href: `${root}/payments`,
      });
    }
  }

  for (const service of getServices(flatId).filter((s) => s.status !== "cancelled")) {
    events.push({
      id: `svc-${service.id}`,
      date: service.scheduledDate,
      title: service.title,
      description: `${service.vendor} · ${service.scheduledTime}`,
      type: "service",
      href: `${root}/services`,
    });
  }

  for (const member of getFamilyByFlat(flatId)) {
    const regDate =
      member.marriageAnniversary ??
      member.dateOfBirth ??
      "2024-06-15";
    events.push({
      id: `fam-${member.id}`,
      date: regDate,
      title: `${member.fullName} registered`,
      description: `${member.relationship} · family records`,
      type: "family",
      href: `${root}/family`,
    });
  }

  events.push({
    id: `fam-update-${flatId}`,
    date: "2025-06-15",
    title: "Family member updated",
    description: "Society office updated household records",
    type: "family",
    href: `${root}/family`,
  });

  const detail = getFlatDetail(flatId);
  if (detail?.owners[0]) {
    events.push({
      id: `owner-${detail.owners[0].id}`,
      date: detail.owners[0].ownershipStartDate,
      title: "Owner registered",
      description: detail.owners[0].fullName,
      type: "occupancy",
      href: `${root}/flat`,
    });
  }

  return events.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getApartmentStats() {
  const occupied = flats.filter(
    (f) => f.occupancyStatus !== "vacant"
  ).length;
  const vacant = flats.filter((f) => f.occupancyStatus === "vacant").length;
  const ownerOccupied = flats.filter(
    (f) => f.occupancyStatus === "owner_occupied"
  ).length;
  const tenantOccupied = flats.filter(
    (f) => f.occupancyStatus === "tenant_occupied"
  ).length;

  return {
    totalBlocks: blocks.length,
    totalFlats: flats.length,
    occupiedFlats: occupied,
    vacantFlats: vacant,
    ownerOccupied,
    tenantOccupied,
    totalResidents: residents.length + owners.length + familyMembers.length,
  };
}

export function getOutstandingPayments(): Payment[] {
  return payments.filter(
    (p) => p.status === "pending" || p.status === "overdue"
  );
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function getOccupancyLabel(status: OccupancyStatus): string {
  const labels: Record<OccupancyStatus, string> = {
    vacant: "Vacant",
    owner_occupied: "Owner Occupied",
    tenant_occupied: "Tenant Occupied",
  };
  return labels[status];
}

export function getOccupancyVariant(
  status: OccupancyStatus
): "default" | "secondary" | "outline" | "destructive" {
  const variants: Record<
    OccupancyStatus,
    "default" | "secondary" | "outline" | "destructive"
  > = {
    vacant: "outline",
    owner_occupied: "default",
    tenant_occupied: "secondary",
  };
  return variants[status];
}

export function getPaymentStatusVariant(
  status: Payment["status"]
): "default" | "secondary" | "destructive" {
  const variants: Record<Payment["status"], "default" | "secondary" | "destructive"> = {
    paid: "default",
    pending: "secondary",
    overdue: "destructive",
  };
  return variants[status];
}

export function getPaymentStatusLabel(status: Payment["status"]): string {
  const labels: Record<Payment["status"], string> = {
    paid: "Paid",
    pending: "Due soon",
    overdue: "Overdue",
  };
  return labels[status];
}

export function getPrimaryOwner(flatId: string): Owner | undefined {
  return owners.find((o) => o.flatId === flatId && o.isPrimary);
}

export function getFlatDetail(flatId: string) {
  const flat = getFlatById(flatId);
  if (!flat) return undefined;

  return {
    flat,
    block: getBlockById(flat.blockId)!,
    owners: getOwnersByFlat(flatId),
    tenants: getTenantsByFlat(flatId),
    family: getFamilyByFlat(flatId),
    payments: getPaymentsByFlat(flatId),
    residents: residents.filter((r) => r.flatId === flatId),
  };
}

export function getAllFlatsWithOwners() {
  return flats.map((flat) => ({
    flat,
    block: getBlockById(flat.blockId)!,
    owner: getPrimaryOwner(flat.id),
    tenant: getTenantsByFlat(flat.id)[0],
  }));
}

export interface FlatTableRow {
  id: string;
  flatNumber: string;
  floor: number;
  residentName: string;
  occupancyStatus: OccupancyStatus;
  familyCount: number;
  pendingBillCount: number;
}

export function getFlatsTableRows(): FlatTableRow[] {
  return flats.map((flat) => {
    const owner = getPrimaryOwner(flat.id);
    const tenant = getTenantsByFlat(flat.id)[0];
    const resident = tenant ?? owner;

    return {
      id: flat.id,
      flatNumber: flat.flatNumber,
      floor: flat.floor,
      residentName: resident?.fullName ?? "—",
      occupancyStatus: flat.occupancyStatus,
      familyCount: getFamilyByFlat(flat.id).length,
      pendingBillCount: getPendingPaymentsByFlat(flat.id).length,
    };
  });
}

export type MaintenanceStatusFilter = "all" | "paid" | "pending" | "overdue" | "vacant";

export interface ResidentTableRow {
  id: string;
  flatNumber: string;
  floor: number;
  residentName: string;
  ownerName: string;
  tenantName: string;
  phone: string;
  ownerPhone: string;
  tenantPhone: string;
  familyNames: string[];
  maintenanceStatus: "paid" | "pending" | "overdue" | "vacant";
  pendingAmount: number;
  occupancyStatus: OccupancyStatus;
}

function normalizeSearchText(value: string) {
  return value.toLowerCase().replace(/\s/g, "");
}

function normalizePhone(value: string) {
  return value.replace(/\D/g, "");
}

function getFlatMaintenanceStatus(flatId: string, occupancy: OccupancyStatus) {
  if (occupancy === "vacant") {
    return { status: "vacant" as const, amount: 0 };
  }
  const pending = getPendingPaymentsByFlat(flatId);
  if (pending.some((p) => p.status === "overdue")) {
    return {
      status: "overdue" as const,
      amount: pending.reduce((s, p) => s + p.amount, 0),
    };
  }
  if (pending.some((p) => p.status === "pending")) {
    return {
      status: "pending" as const,
      amount: pending.reduce((s, p) => s + p.amount, 0),
    };
  }
  return { status: "paid" as const, amount: 0 };
}

export function getResidentTableRows(): ResidentTableRow[] {
  return getAllFlatsWithOwners().map(({ flat, owner, tenant }) => {
    const resident = tenant ?? owner;
    const family = getFamilyByFlat(flat.id);
    const billing = getFlatMaintenanceStatus(flat.id, flat.occupancyStatus);

    return {
      id: flat.id,
      flatNumber: flat.flatNumber,
      floor: flat.floor,
      residentName: resident?.fullName ?? "Vacant",
      ownerName: owner?.fullName ?? "",
      tenantName: tenant?.fullName ?? "",
      phone: resident?.phone ?? owner?.phone ?? tenant?.phone ?? "",
      ownerPhone: owner?.phone ?? "",
      tenantPhone: tenant?.phone ?? "",
      familyNames: family.map((m) => m.fullName),
      maintenanceStatus: billing.status,
      pendingAmount: billing.amount,
      occupancyStatus: flat.occupancyStatus,
    };
  });
}

export function filterResidentTableRows(
  rows: ResidentTableRow[],
  query: string,
  maintenanceFilter: MaintenanceStatusFilter = "all",
  occupancyFilter: OccupancyStatus | "all" = "all"
) {
  const q = normalizeSearchText(query);
  const phoneQuery = normalizePhone(query);

  return rows.filter((row) => {
    const matchesMaintenance =
      maintenanceFilter === "all" || row.maintenanceStatus === maintenanceFilter;
    const matchesOccupancy =
      occupancyFilter === "all" || row.occupancyStatus === occupancyFilter;

    if (!matchesMaintenance || !matchesOccupancy) return false;
    if (!q && !phoneQuery) return true;

    const phones = [row.phone, row.ownerPhone, row.tenantPhone]
      .filter(Boolean)
      .map(normalizePhone);

    const matchesPhone =
      phoneQuery.length >= 3 &&
      phones.some((phone) => phone.includes(phoneQuery));

    const matchesText =
      q.length > 0 &&
      (row.flatNumber.toLowerCase().includes(q) ||
        normalizeSearchText(row.residentName).includes(q) ||
        normalizeSearchText(row.ownerName).includes(q) ||
        normalizeSearchText(row.tenantName).includes(q) ||
        row.familyNames.some((name) =>
          normalizeSearchText(name).includes(q)
        ));

    return matchesPhone || matchesText;
  });
}

export function getOverduePayments(): Payment[] {
  return payments.filter((p) => p.status === "overdue");
}

export interface InspectorDashboardAlert {
  id: string;
  message: string;
  href?: string;
  actionLabel?: string;
  urgent?: boolean;
}

export interface InspectorDashboardActivityItem {
  id: string;
  label: string;
  href?: string;
  date: string;
}

export function getInspectorDashboardSummary() {
  const apartment = getApartment();
  const maintenance = getMaintenanceSummary();
  const { outstanding } = getMaintenanceStats();
  const overdueOnly = getOverduePayments();
  const unpaidFlatIds = new Set(outstanding.map((p) => p.flatId));
  const overdueFlatIds = new Set(overdueOnly.map((p) => p.flatId));
  const todayIso = getDemoTodayIso();

  const overdueFlats = overdueOnly.slice(0, 5).map((payment) => {
    const flat = getFlatById(payment.flatId);
    const daysOverdue = Math.max(
      0,
      Math.floor(
        (new Date(todayIso).getTime() - new Date(payment.dueDate).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    );
    return {
      paymentId: payment.id,
      flatId: payment.flatId,
      flatNumber: flat?.flatNumber ?? "—",
      period: payment.period,
      amount: payment.amount,
      dueDate: payment.dueDate,
      daysOverdue,
    };
  });

  const emergencyNotice =
    getNotices().find((n) => n.category === "emergency" || n.isEmergency) ?? null;

  const alerts: InspectorDashboardAlert[] = [];

  if (overdueFlatIds.size > 0) {
    alerts.push({
      id: "overdue-flats",
      message: `${overdueFlatIds.size} flats overdue maintenance`,
      href: "/inspector/maintenance",
      actionLabel: "Open bills",
      urgent: true,
    });
  }

  if (emergencyNotice) {
    alerts.push({
      id: "emergency-notice",
      message: `Emergency notice · ${emergencyNotice.title}`,
      urgent: true,
    });
  }

  const recentTenants = [...tenants]
    .filter((t) => t.isActive)
    .sort(
      (a, b) =>
        new Date(b.leaseStartDate).getTime() - new Date(a.leaseStartDate).getTime()
    )
    .slice(0, 3)
    .map((tenant) => ({
      tenant,
      flat: getFlatById(tenant.flatId)!,
    }))
    .filter((item) => item.flat);

  const societyFeed: InspectorDashboardActivityItem[] = [];

  for (const payment of payments
    .filter((p) => p.status === "paid" && p.paidDate)
    .sort((a, b) => b.paidDate!.localeCompare(a.paidDate!))
    .slice(0, 6)) {
    const flat = getFlatById(payment.flatId);
    if (!flat) continue;
    societyFeed.push({
      id: `pay-${payment.id}`,
      label: `Payment recorded · Flat ${flat.flatNumber}`,
      href: `/inspector/flats/${flat.id}`,
      date: payment.paidDate!,
    });
  }

  for (const notice of getNotices().slice(0, 4)) {
    societyFeed.push({
      id: `notice-${notice.id}`,
      label: `Notice published · ${notice.title}`,
      date: notice.publishedAt,
    });
  }

  for (const { tenant, flat } of recentTenants) {
    societyFeed.push({
      id: `move-${tenant.id}`,
      label: `Tenant move-in · Flat ${flat.flatNumber}`,
      href: `/inspector/flats/${flat.id}`,
      date: tenant.leaseStartDate,
    });
  }

  const societyUpdates = societyFeed
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  const contacts = getCommitteeContacts();
  const adminPhone =
    contacts.committee.find((c) => c.role === "Secretary")?.phone ?? apartment.phone;

  return {
    apartmentName: apartment.name,
    billingMonth: maintenance.month,
    unpaidFlatCount: unpaidFlatIds.size,
    overdueFlatCount: overdueFlatIds.size,
    overdueFlats,
    alerts,
    societyUpdates,
    adminPhone,
  };
}

export function getFlatTimeline(flatId: string): FlatTimelineEvent[] {
  const detail = getFlatDetail(flatId);
  if (!detail) return [];

  const events: FlatTimelineEvent[] = [];

  for (const owner of detail.owners) {
    events.push({
      id: `owner-${owner.id}`,
      date: owner.ownershipStartDate,
      title: "Owner registered",
      description: `${owner.fullName} registered as owner`,
      type: "occupancy",
    });
  }

  for (const tenant of detail.tenants) {
    events.push({
      id: `tenant-${tenant.id}`,
      date: tenant.leaseStartDate,
      title: "Tenant move-in",
      description: `${tenant.fullName} lease started`,
      type: "occupancy",
    });
  }

  for (const payment of detail.payments) {
    if (payment.status === "paid" && payment.paidDate) {
      events.push({
        id: `pay-${payment.id}`,
        date: payment.paidDate,
        title: `${payment.period} paid`,
        description: `${formatCurrency(payment.amount)} · ${getPaymentTypeLabel(payment.type)}`,
        type: "payment",
        href: `/inspector/flats/${flatId}`,
      });
    } else if (payment.status !== "paid") {
      events.push({
        id: `due-${payment.id}`,
        date: payment.dueDate,
        title: `${payment.period} ${payment.status}`,
        description: `${formatCurrency(payment.amount)} outstanding`,
        type: "payment",
        href: `/inspector/maintenance`,
      });
    }
  }

  for (const notice of getNotices().slice(0, 5)) {
    events.push({
      id: `notice-${notice.id}`,
      date: notice.publishedAt,
      title: notice.title,
      description: getNoticeCategoryLabel(notice.category),
      type: "notice",
    });
  }

  const flatServices = getServices(flatId).filter((s) => s.status !== "cancelled");
  for (const service of flatServices) {
    events.push({
      id: `svc-${service.id}`,
      date: service.scheduledDate,
      title: service.title,
      description: `${service.vendor} · ${service.status}`,
      type: "service",
    });
  }

  return events.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getMaintenanceStats() {
  const summary = getMaintenanceSummary();
  const outstanding = getOutstandingPayments();
  const paidCount = payments.filter((p) => p.status === "paid").length;
  const pendingCount = payments.filter((p) => p.status === "pending").length;
  const overdueCount = payments.filter((p) => p.status === "overdue").length;

  return {
    summary,
    outstanding,
    paidCount,
    pendingCount,
    overdueCount,
  };
}

export function getPendingPaymentsByFlat(flatId: string): Payment[] {
  return getPaymentsByFlat(flatId).filter(
    (p) => p.status === "pending" || p.status === "overdue"
  );
}

export function getResidentTypeLabel(
  status: OccupancyStatus
): "Owner" | "Tenant" | "Vacant" {
  const labels: Record<OccupancyStatus, "Owner" | "Tenant" | "Vacant"> = {
    owner_occupied: "Owner",
    tenant_occupied: "Tenant",
    vacant: "Vacant",
  };
  return labels[status];
}
