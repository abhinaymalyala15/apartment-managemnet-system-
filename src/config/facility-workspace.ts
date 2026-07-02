/**
 * Facility workspace registry — asset categories and future modules (Phase 7G).
 */
import type { AssetCategory } from "@/types";

export interface AssetCategoryDef {
  id: AssetCategory;
  label: string;
  enabled: boolean;
  phase?: string;
}

export const ASSET_CATEGORIES: AssetCategoryDef[] = [
  { id: "lift", label: "Lift", enabled: true },
  { id: "water_tank", label: "Water tank", enabled: true },
  { id: "generator", label: "Generator", enabled: true },
  { id: "fire_safety", label: "Fire safety", enabled: true },
  { id: "cctv", label: "CCTV", enabled: true },
  { id: "garden", label: "Garden", enabled: true },
  { id: "solar", label: "Solar", enabled: true },
  { id: "stp", label: "STP", enabled: false, phase: "Future" },
  { id: "wtp", label: "WTP", enabled: false, phase: "Future" },
  { id: "swimming_pool", label: "Swimming pool", enabled: false, phase: "Future" },
  { id: "club_house", label: "Club house", enabled: false, phase: "Future" },
  { id: "gym", label: "Gym", enabled: false, phase: "Future" },
  { id: "play_area", label: "Children's play area", enabled: false, phase: "Future" },
  { id: "ev_charging", label: "EV charging", enabled: false, phase: "Future" },
  { id: "dg_backup", label: "DG backup", enabled: false, phase: "Future" },
  { id: "street_lighting", label: "Street lighting", enabled: false, phase: "Future" },
  { id: "other", label: "Other", enabled: true },
];

export interface FacilityModuleDef {
  id: string;
  label: string;
  href?: string;
  enabled: boolean;
  phase?: string;
}

export const FACILITY_NAV_MODULES: FacilityModuleDef[] = [
  { id: "schedule", label: "Schedule", href: "/inspector/services/schedule", enabled: true },
  { id: "staff", label: "Staff", href: "/inspector/services/staff", enabled: true },
  { id: "vendors", label: "Vendors", href: "/inspector/services/vendors", enabled: true },
  { id: "assets", label: "Assets", href: "/inspector/services/assets", enabled: true },
  { id: "inventory", label: "Inventory", enabled: false, phase: "Future" },
  { id: "work_orders", label: "Work orders", enabled: false, phase: "Future" },
  { id: "inspections", label: "Inspections", enabled: false, phase: "Future" },
  { id: "facility_booking", label: "Facility booking", enabled: false, phase: "Future" },
];

export const FUTURE_FACILITY_MODULES = [
  "Inventory",
  "Purchase orders",
  "Vendor bills",
  "Work orders",
  "Complaint assignments",
  "Preventive maintenance",
  "Facility booking",
  "Inspection checklists",
];
