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
    id: "maintenance",
    label: "Maintenance",
    description: "Rate per sq.ft and monthly billing cycle",
    href: routes.dashboard.admin.billing.maintenance,
  },
  {
    id: "corpus",
    label: "Corpus fund",
    description: "Corpus fund contribution rules",
    href: routes.dashboard.admin.billing.corpus,
  },
  {
    id: "water",
    label: "Water charges",
    description: "Water fund and consumption billing",
    href: routes.dashboard.admin.billing.water,
  },
  {
    id: "lift",
    label: "Lift fund",
    description: "Lift maintenance fund allocation",
    href: routes.dashboard.admin.billing.lift,
  },
  {
    id: "special",
    label: "Special assessment",
    description: "One-time or periodic special charges",
    href: routes.dashboard.admin.billing.special,
  },
  {
    id: "penalty",
    label: "Late fee & penalty",
    description: "Grace period, late fee %, and penalty rules",
    href: routes.dashboard.admin.billing.penalty,
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

export const ADMIN_SERVICE_SECTIONS: AdminModuleDef[] = [
  {
    id: "assets",
    label: "Assets",
    description: "Generators, lifts, pumps, and equipment registry",
    href: routes.dashboard.admin.services.assets,
  },
  {
    id: "vendors",
    label: "Vendors",
    description: "Approved vendor directory",
    href: routes.dashboard.admin.services.vendors,
  },
  {
    id: "amc",
    label: "AMC contracts",
    description: "Annual maintenance contracts and renewal dates",
    href: routes.dashboard.admin.services.amc,
  },
  {
    id: "frequency",
    label: "Service frequency",
    description: "Scheduled service intervals and reminders",
    href: routes.dashboard.admin.services.frequency,
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
