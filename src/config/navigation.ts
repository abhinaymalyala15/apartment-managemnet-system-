import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Building2,
  Users,
  Wallet,
  Bell,
  Wrench,
  FileText,
  BarChart3,
  Settings,
  Home,
  User,
} from "lucide-react";
import { routes } from "./routes";
import type { DashboardRole } from "./routes";
import demoUsers from "@/data/demo-users.json";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Phase when this nav item will be implemented */
  phase?: number;
  disabled?: boolean;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export interface RoleNavConfig {
  role: DashboardRole;
  label: string;
  userDisplayName: string;
  userSubtitle: string;
  groups: NavGroup[];
}

/**
 * Navigation config per role.
 * Resident (Phase 4) and Inspector (Phase 5) modules are active.
 * Admin and Platform items remain disabled until their phases.
 */
export const roleNavigation: Record<DashboardRole, RoleNavConfig> = {
  resident: {
    role: "resident",
    label: "My Apartment",
    userDisplayName: demoUsers.resident.fullName,
    userSubtitle: `Flat ${demoUsers.resident.flatNumber}`,
    groups: [
      {
        label: "Menu",
        items: [
          {
            label: "Home",
            href: routes.dashboard.resident.root,
            icon: LayoutDashboard,
          },
          {
            label: "Maintenance bills",
            href: `${routes.dashboard.resident.root}/payments`,
            icon: Wallet,
          },
          {
            label: "Announcements",
            href: `${routes.dashboard.resident.root}/notices`,
            icon: Bell,
          },
        ],
      },
      {
        label: "My flat",
        items: [
          {
            label: "Flat details",
            href: `${routes.dashboard.resident.root}/flat`,
            icon: Home,
          },
          {
            label: "Family",
            href: `${routes.dashboard.resident.root}/family`,
            icon: Users,
          },
          {
            label: "Society visits",
            href: `${routes.dashboard.resident.root}/services`,
            icon: Wrench,
          },
          {
            label: "My account",
            href: `${routes.dashboard.resident.root}/profile`,
            icon: User,
          },
        ],
      },
    ],
  },
  inspector: {
    role: "inspector",
    label: "Inspector",
    userDisplayName: demoUsers.inspector.fullName,
    userSubtitle: "Sylvan Shelter Apartment",
    groups: [
      {
        label: "Menu",
        items: [
          {
            label: "Dashboard",
            href: routes.dashboard.inspector.root,
            icon: LayoutDashboard,
          },
        ],
      },
      {
        label: "Lookup",
        items: [
          {
            label: "All flats",
            href: `${routes.dashboard.inspector.root}/flats`,
            icon: Building2,
          },
          {
            label: "Find people",
            href: `${routes.dashboard.inspector.root}/residents`,
            icon: Users,
          },
        ],
      },
      {
        label: "Finance",
        items: [
          {
            label: "Unpaid bills",
            href: `${routes.dashboard.inspector.root}/maintenance`,
            icon: Wallet,
          },
          {
            label: "Reports",
            href: `${routes.dashboard.inspector.root}/reports`,
            icon: BarChart3,
          },
        ],
      },
    ],
  },
  admin: {
    role: "admin",
    label: "Apartment Admin",
    userDisplayName: demoUsers.admin.fullName,
    userSubtitle: "Sylvan Shelter Apartment",
    groups: [
      {
        label: "Main",
        items: [
          {
            label: "Dashboard",
            href: routes.dashboard.admin.root,
            icon: LayoutDashboard,
          },
          {
            label: "Structure",
            href: `${routes.dashboard.admin.root}/structure`,
            icon: Building2,
            phase: 6,
            disabled: true,
          },
          {
            label: "Residents",
            href: `${routes.dashboard.admin.root}/residents`,
            icon: Users,
            phase: 6,
            disabled: true,
          },
          {
            label: "Maintenance",
            href: `${routes.dashboard.admin.root}/maintenance`,
            icon: Wallet,
            phase: 6,
            disabled: true,
          },
          {
            label: "Notices",
            href: `${routes.dashboard.admin.root}/notices`,
            icon: Bell,
            phase: 6,
            disabled: true,
          },
          {
            label: "Documents",
            href: `${routes.dashboard.admin.root}/documents`,
            icon: FileText,
            phase: 6,
            disabled: true,
          },
          {
            label: "Reports",
            href: `${routes.dashboard.admin.root}/reports`,
            icon: BarChart3,
            phase: 6,
            disabled: true,
          },
        ],
      },
      {
        label: "Settings",
        items: [
          {
            label: "Apartment Settings",
            href: `${routes.dashboard.admin.root}/settings`,
            icon: Settings,
            phase: 6,
            disabled: true,
          },
        ],
      },
    ],
  },
  platform: {
    role: "platform",
    label: "Platform Admin",
    userDisplayName: demoUsers.platform.fullName,
    userSubtitle: "Platform operator",
    groups: [
      {
        label: "Platform",
        items: [
          {
            label: "Dashboard",
            href: routes.dashboard.platform.root,
            icon: LayoutDashboard,
          },
          {
            label: "Apartments",
            href: `${routes.dashboard.platform.root}/apartments`,
            icon: Building2,
            phase: 7,
            disabled: true,
          },
          {
            label: "Users",
            href: `${routes.dashboard.platform.root}/users`,
            icon: Users,
            phase: 7,
            disabled: true,
          },
          {
            label: "Subscriptions",
            href: `${routes.dashboard.platform.root}/subscriptions`,
            icon: Wallet,
            phase: 7,
            disabled: true,
          },
          {
            label: "Reports",
            href: `${routes.dashboard.platform.root}/reports`,
            icon: BarChart3,
            phase: 7,
            disabled: true,
          },
        ],
      },
    ],
  },
};
