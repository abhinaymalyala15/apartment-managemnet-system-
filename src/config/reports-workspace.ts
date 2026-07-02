/**
 * Reports & Analytics registry (Phase 7H).
 */
export type ReportId =
  | "collection"
  | "financial"
  | "occupancy"
  | "maintenance"
  | "communication"
  | "assets"
  | "movement";

export interface ReportDef {
  id: ReportId;
  label: string;
  description: string;
  href: string;
  enabled: boolean;
}

export const REPORT_DEFINITIONS: ReportDef[] = [
  {
    id: "collection",
    label: "Collection",
    description: "Collection rate, trends, and block-wise performance",
    href: "/inspector/reports/collection",
    enabled: true,
  },
  {
    id: "financial",
    label: "Financial",
    description: "Collected, outstanding, and billing summary",
    href: "/inspector/reports/financial",
    enabled: true,
  },
  {
    id: "occupancy",
    label: "Occupancy",
    description: "Owner, tenant, and vacant breakdown with drill-down",
    href: "/inspector/reports/occupancy",
    enabled: true,
  },
  {
    id: "maintenance",
    label: "Maintenance",
    description: "Outstanding bills, overdue flats, and follow-ups",
    href: "/inspector/reports/maintenance",
    enabled: true,
  },
  {
    id: "communication",
    label: "Communication",
    description: "Notices published, drafts, and emergency alerts",
    href: "/inspector/reports/communication",
    enabled: true,
  },
  {
    id: "assets",
    label: "Assets",
    description: "Asset health, AMC status, and service compliance",
    href: "/inspector/reports/assets",
    enabled: true,
  },
  {
    id: "movement",
    label: "Move-in / Move-out",
    description: "Recent household changes by block and flat",
    href: "/inspector/reports/movement",
    enabled: true,
  },
];

export const FUTURE_REPORTS = [
  "Visitor analytics",
  "Complaint SLA",
  "Parking utilization",
  "Facility booking usage",
  "AI insights",
];
