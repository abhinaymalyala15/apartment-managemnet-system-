export type OccupancyStatus = "vacant" | "owner_occupied" | "tenant_occupied";

export interface Apartment {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
  registrationNumber: string;
  totalBlocks: number;
  totalFlats: number;
  yearEstablished: number;
  description: string;
}

export interface Block {
  id: string;
  apartmentId: string;
  name: string;
  code: string;
  floorCount: number;
  totalFlats: number;
  description: string;
}

export interface Flat {
  id: string;
  apartmentId: string;
  blockId: string;
  flatNumber: string;
  floor: number;
  areaSqft: number;
  bedrooms: number;
  flatType: string;
  parkingSlots?: number;
  occupancyStatus: OccupancyStatus;
}

export interface Resident {
  id: string;
  apartmentId: string;
  flatId: string;
  fullName: string;
  email: string;
  phone: string;
  role: "resident";
}

export interface Owner {
  id: string;
  apartmentId: string;
  flatId: string;
  fullName: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  isPrimary: boolean;
  ownershipStartDate: string;
}

export interface Tenant {
  id: string;
  apartmentId: string;
  flatId: string;
  fullName: string;
  email: string;
  phone: string;
  leaseStartDate: string;
  leaseEndDate: string;
  isActive: boolean;
}

export interface FamilyMember {
  id: string;
  apartmentId: string;
  flatId: string;
  fullName: string;
  relationship: string;
  phone?: string;
  email?: string;
  dateOfBirth?: string;
  marriageAnniversary?: string;
}

export interface Payment {
  id: string;
  apartmentId: string;
  flatId: string;
  amount: number;
  type: "maintenance" | "penalty" | "special_levy";
  status: "paid" | "pending" | "overdue";
  dueDate: string;
  paidDate?: string;
  receiptNumber?: string;
  period: string;
}

export interface Notice {
  id: string;
  apartmentId: string;
  title: string;
  content: string;
  category: "general" | "maintenance" | "event" | "emergency";
  publishedAt: string;
  priority: "low" | "medium" | "high";
}

export interface Service {
  id: string;
  apartmentId: string;
  flatId?: string;
  title: string;
  description: string;
  serviceType: string;
  scheduledDate: string;
  scheduledTime: string;
  vendor: string;
  status: "scheduled" | "completed" | "cancelled";
  lastServiceDate?: string;
  nextDueDate?: string;
  frequency?: string;
}

export interface DemoUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: "resident" | "inspector" | "admin" | "super_admin";
  flatId?: string;
  flatNumber?: string;
}

export interface GalleryImage {
  id: string;
  apartmentId: string;
  title: string;
  category: string;
  imageUrl: string;
  caption: string;
}

export interface MaintenanceSummary {
  totalCollected: number;
  totalOutstanding: number;
  collectionRate: number;
  month: string;
  maintenanceRatePerSqft?: number;
  flatAreaSqft?: number;
  monthlyMaintenancePerFlat?: number;
}
