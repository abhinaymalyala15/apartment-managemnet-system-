/**
 * Apartment Admin portal — configuration modules only.
 * Operational work lives under /inspector.
 */
import { routes } from "@/config/routes";

export interface AdminModuleDef {
  id: string;
  label: string;
  description: string;
  href: string;
}

export const ADMIN_BILLING_MODULES: AdminModuleDef[] = [
  {
    id: "flats",
    label: "Flat billing",
    description: "Per-flat maintenance, other charges, and pending clearance",
    href: routes.dashboard.admin.billing.flats,
  },
  {
    id: "rules",
    label: "Billing rules",
    description: "Billing cycle, late fee, and penalty configuration",
    href: routes.dashboard.admin.billing.rules,
  },
];

export const ADMIN_APARTMENT_SECTIONS: AdminModuleDef[] = [
  {
    id: "profile",
    label: "Profile",
    description: "Name, logo, address, registration, GST",
    href: routes.dashboard.admin.apartment.profile,
  },
  {
    id: "committee",
    label: "Committee",
    description: "RWA committee members",
    href: routes.dashboard.admin.apartment.committee,
  },
  {
    id: "contacts",
    label: "Emergency contacts",
    description: "Emergency and office contacts",
    href: routes.dashboard.admin.apartment.contacts,
  },
  {
    id: "bank",
    label: "Bank details",
    description: "Society bank accounts for collections",
    href: routes.dashboard.admin.apartment.bank,
  },
];

export const ADMIN_USER_SECTIONS: AdminModuleDef[] = [
  {
    id: "inspectors",
    label: "Inspectors",
    description: "Apartment inspector accounts",
    href: routes.dashboard.admin.users.inspectors,
  },
  {
    id: "staff",
    label: "Office staff",
    description: "Office and admin staff",
    href: routes.dashboard.admin.users.staff,
  },
  {
    id: "security",
    label: "Security",
    description: "Security supervisor accounts",
    href: routes.dashboard.admin.users.security,
  },
  {
    id: "committee",
    label: "Committee logins",
    description: "Committee member portal access",
    href: routes.dashboard.admin.users.committee,
  },
  {
    id: "residents",
    label: "Resident logins",
    description: "Resident app access management",
    href: routes.dashboard.admin.users.residents,
  },
  {
    id: "roles",
    label: "Roles & permissions",
    description: "Role definitions and access control",
    href: routes.dashboard.admin.users.roles,
  },
];
