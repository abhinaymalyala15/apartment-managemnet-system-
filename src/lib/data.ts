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

import demoUsersData from "@/data/demo-users.json";

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
} from "@/types";

export const DEMO_RESIDENT_ID = "resident-srinivas";

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

export function getFamilyByFlat(flatId: string): FamilyMember[] {
  return familyMembers.filter((f) => f.flatId === flatId);
}

export function getPaymentsByFlat(flatId: string): Payment[] {
  return payments
    .filter((p) => p.flatId === flatId)
    .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
}

export function getNotices(): Notice[] {
  return [...notices].sort(
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

export interface ResidentTableRow {
  id: string;
  flatNumber: string;
  floor: number;
  residentName: string;
  phone: string;
  occupancyStatus: OccupancyStatus;
}

export function getResidentTableRows(): ResidentTableRow[] {
  return getAllFlatsWithOwners().map(({ flat, owner, tenant }) => {
    const resident = tenant ?? owner;
    return {
      id: flat.id,
      flatNumber: flat.flatNumber,
      floor: flat.floor,
      residentName: resident?.fullName ?? "—",
      phone: resident?.phone ?? "—",
      occupancyStatus: flat.occupancyStatus,
    };
  });
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
