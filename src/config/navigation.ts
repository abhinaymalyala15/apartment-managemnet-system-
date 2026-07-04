import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Building2,
  Users,
  Wallet,
  Bell,
  Wrench,
  BarChart3,
  Settings,
  Home,
  User,
  Clock,
  MessageSquare,
  UserCheck,
  Layers,
  FileText,
} from "lucide-react";
import { routes } from "./routes";
import type { DashboardRole } from "./routes";
import demoUsers from "@/data/demo-users.json";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
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

export const roleNavigation: Record<DashboardRole, RoleNavConfig> = {
  resident: {
    role: "resident",
    label: "My Apartment",
    userDisplayName: demoUsers.resident.fullName,
    userSubtitle: `Flat ${demoUsers.resident.flatNumber}`,
    groups: [
      {
        label: "Home",
        items: [
          {
            label: "Home",
            href: routes.dashboard.resident.root,
            icon: LayoutDashboard,
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
            label: "Activity timeline",
            href: `${routes.dashboard.resident.root}/timeline`,
            icon: Clock,
          },
        ],
      },
      {
        label: "Society",
        items: [
          {
            label: "Notices",
            href: `${routes.dashboard.resident.root}/notices`,
            icon: Bell,
          },
          {
            label: "Work visits",
            href: `${routes.dashboard.resident.root}/services`,
            icon: Wrench,
          },
        ],
      },
      {
        label: "Money",
        items: [
          {
            label: "My bills",
            href: `${routes.dashboard.resident.root}/payments`,
            icon: Wallet,
          },
        ],
      },
      {
        label: "You",
        items: [
          {
            label: "My details",
            href: `${routes.dashboard.resident.root}/profile`,
            icon: User,
          },
        ],
      },
    ],
  },
  inspector: {
    role: "inspector",
    label: "Apartment Inspector",
    userDisplayName: demoUsers.inspector.fullName,
    userSubtitle: "Sylvan Shelter Apartment",
    groups: [
      {
        label: "",
        items: [
          {
            label: "Dashboard",
            href: routes.dashboard.inspector.root,
            icon: LayoutDashboard,
          },
          {
            label: "Residents",
            href: routes.dashboard.inspector.residents,
            icon: Users,
          },
          {
            label: "Maintenance",
            href: routes.dashboard.inspector.maintenance.outstanding,
            icon: Wallet,
          },
          {
            label: "Complaints",
            href: routes.dashboard.inspector.complaints.open,
            icon: MessageSquare,
          },
          {
            label: "Visitors",
            href: routes.dashboard.inspector.visitors.root,
            icon: UserCheck,
          },
          {
            label: "Notices",
            href: routes.dashboard.inspector.notices.root,
            icon: Bell,
          },
          {
            label: "Services",
            href: routes.dashboard.inspector.services.root,
            icon: Wrench,
          },
          {
            label: "Reports",
            href: routes.dashboard.inspector.reports.root,
            icon: BarChart3,
          },
          {
            label: "Settings",
            href: routes.dashboard.inspector.settings.root,
            icon: Settings,
          },
        ],
      },
    ],
  },
  admin: {
    role: "admin",
    label: "Apartment Admin",
    userDisplayName: demoUsers.admin.fullName,
    userSubtitle: "Sylvan Shelter · Configuration",
    groups: [
      {
        label: "",
        items: [
          {
            label: "Dashboard",
            href: routes.dashboard.admin.root,
            icon: LayoutDashboard,
          },
          {
            label: "Apartment",
            href: routes.dashboard.admin.apartment.profile,
            icon: Building2,
          },
          {
            label: "Blocks",
            href: routes.dashboard.admin.blocks.root,
            icon: Layers,
          },
          {
            label: "Flats",
            href: routes.dashboard.admin.flats.root,
            icon: Home,
          },
          {
            label: "Residents",
            href: routes.dashboard.admin.residents,
            icon: Users,
          },
          {
            label: "Billing Setup",
            href: routes.dashboard.admin.billing.flats,
            icon: Wallet,
          },
          {
            label: "Services",
            href: routes.dashboard.admin.services.root,
            icon: Wrench,
          },
          {
            label: "Users",
            href: routes.dashboard.admin.users.inspectors,
            icon: User,
          },
          {
            label: "Documents",
            href: routes.dashboard.admin.documents,
            icon: FileText,
          },
          {
            label: "Settings",
            href: routes.dashboard.admin.settings,
            icon: Settings,
          },
        ],
      },
    ],
  },
  platform: {
    role: "platform",
    label: "Platform Admin",
    userDisplayName: demoUsers.platform.fullName,
    userSubtitle: "ApartmentERP Platform",
    groups: [
      {
        label: "",
        items: [
          {
            label: "Dashboard",
            href: routes.dashboard.admin.root,
            icon: LayoutDashboard,
          },
        ],
      },
    ],
  },
};
