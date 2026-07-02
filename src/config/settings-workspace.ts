/**
 * Apartment Configuration registry (Phase 7I).
 */
import { routes } from "@/config/routes";

export interface SettingsModuleDef {
  id: string;
  label: string;
  description: string;
  href: string;
  enabled: boolean;
  phase?: string;
}

export const SETTINGS_NAV_MODULES: SettingsModuleDef[] = [
  {
    id: "profile",
    label: "Apartment profile",
    description: "Society identity and registration",
    href: routes.dashboard.inspector.settings.profile,
    enabled: true,
  },
  {
    id: "committee",
    label: "Committee",
    description: "RWA committee members",
    href: routes.dashboard.inspector.settings.committee,
    enabled: true,
  },
  {
    id: "contacts",
    label: "Emergency contacts",
    description: "Emergency and office contacts",
    href: routes.dashboard.inspector.settings.contacts,
    enabled: true,
  },
  {
    id: "team",
    label: "Staff & roles",
    description: "Office staff and permissions",
    href: routes.dashboard.inspector.settings.team,
    enabled: true,
  },
  {
    id: "documents",
    label: "Documents",
    description: "Society, flat, and asset files",
    href: routes.dashboard.inspector.settings.documents.society,
    enabled: true,
  },
];

export const FUTURE_SETTINGS_MODULES = [
  "Visitor policies",
  "Parking rules",
  "Complaint categories",
  "Facility booking rules",
  "Auto-billing schedules",
  "Multi-language",
];
