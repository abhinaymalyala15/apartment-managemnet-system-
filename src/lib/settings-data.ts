/**
 * Apartment Configuration data layer (Phase 7I).
 */
import apartmentSettingsData from "@/data/apartment-settings.json";
import maintenanceConfigData from "@/data/maintenance-config.json";
import staffData from "@/data/staff.json";
import {
  formatCurrency,
  getApartment,
  getBlockById,
  getBlocks,
  getCommitteeContacts,
  getFlats,
  getFlatsByBlock,
  getMaintenanceSummary,
} from "@/lib/data";
import { routes } from "@/config/routes";
import type {
  AdminRoleDefinition,
  Apartment,
  CommitteeContacts,
  CommitteeMember,
  EmergencyContact,
  IntegrationDef,
  MaintenanceBillingConfig,
  SettingsSummary,
  StaffMember,
  StructureBlockSummary,
  SystemPreferences,
} from "@/types";

const settingsRoot = apartmentSettingsData as {
  preferences: SystemPreferences;
  roles: AdminRoleDefinition[];
  integrations: IntegrationDef[];
};

const maintenanceConfig = maintenanceConfigData as MaintenanceBillingConfig;
const staffMembers = staffData as StaffMember[];

export function getSettingsSummary(): SettingsSummary {
  const apartment = getApartment();
  const contacts = getCommitteeContacts();
  return {
    apartmentName: apartment.name,
    totalBlocks: apartment.totalBlocks,
    totalFlats: apartment.totalFlats,
    committeeCount: contacts.committee.length,
    staffCount: staffMembers.filter((s) => s.isActive).length,
    maintenanceRate: maintenanceConfig.maintenanceRatePerSqft,
    billingCycleDay: maintenanceConfig.billingCycleDay,
  };
}

export function getApartmentProfile(): Apartment {
  return getApartment();
}

export function getStructureBlockSummaries(): StructureBlockSummary[] {
  return getBlocks().map((block) => {
    const flats = getFlatsByBlock(block.id);
    const occupied = flats.filter((f) => f.occupancyStatus !== "vacant").length;
    return {
      id: block.id,
      name: block.name,
      code: block.code,
      floorCount: block.floorCount,
      flatCount: flats.length || block.totalFlats,
      occupiedCount: occupied,
      vacantCount: flats.length - occupied,
      description: block.description,
      href: `${routes.dashboard.inspector.root}/blocks/${block.id}`,
    };
  });
}

export function getStructureStats() {
  const flats = getFlats();
  const blocks = getBlocks();
  const activeBlocks = blocks.filter((b) => getFlatsByBlock(b.id).length > 0);
  return {
    blockCount: blocks.length,
    activeBlockCount: activeBlocks.length,
    flatCount: flats.length,
    floorCount: Math.max(...blocks.map((b) => b.floorCount), 0),
    avgAreaSqft: flats.length
      ? Math.round(flats.reduce((s, f) => s + f.areaSqft, 0) / flats.length)
      : maintenanceConfig.defaultFlatAreaSqft,
  };
}

export function getMaintenanceBillingConfig(): MaintenanceBillingConfig {
  return maintenanceConfig;
}

export function getComputedMaintenancePreview() {
  const config = getMaintenanceBillingConfig();
  const monthly = config.maintenanceRatePerSqft * config.defaultFlatAreaSqft;
  const summary = getMaintenanceSummary();
  return {
    monthlyPerFlat: monthly,
    formattedMonthly: formatCurrency(monthly),
    currentCycle: summary.month,
    collectionRate: summary.collectionRate,
  };
}

export function getCommitteeMembers(): CommitteeMember[] {
  return getCommitteeContacts().committee;
}

export function getEmergencyContactsList(): EmergencyContact[] {
  return getCommitteeContacts().emergency;
}

export function getSocietyOfficeContact(): CommitteeContacts["office"] {
  return getCommitteeContacts().office;
}

export function getStaffRoster(): Array<
  StaffMember & { roleLabel: string; blockLabels: string }
> {
  const roles = getRoleDefinitions();
  return staffMembers.map((member) => {
    const role = roles.find((r) => r.id === member.roleId);
    const blockLabels =
      member.blockIds.length === 0
        ? "All blocks"
        : member.blockIds
            .map((id) => getBlockById(id)?.name ?? id)
            .join(", ");
    return {
      ...member,
      roleLabel: role?.label ?? member.roleId,
      blockLabels,
    };
  });
}

export function getRoleDefinitions(): AdminRoleDefinition[] {
  return settingsRoot.roles;
}

export function getSystemPreferences(): SystemPreferences {
  return settingsRoot.preferences;
}

export function getIntegrationRegistry(): IntegrationDef[] {
  return settingsRoot.integrations;
}

export function getStaffMemberById(id: string) {
  return staffMembers.find((s) => s.id === id);
}

export function getFlatConfigurationSummary() {
  const flats = getFlats();
  const byType = new Map<string, number>();
  for (const flat of flats) {
    byType.set(flat.flatType, (byType.get(flat.flatType) ?? 0) + 1);
  }
  return {
    totalFlats: flats.length,
    byType: [...byType.entries()].map(([type, count]) => ({ type, count })),
    defaultArea: maintenanceConfig.defaultFlatAreaSqft,
  };
}
