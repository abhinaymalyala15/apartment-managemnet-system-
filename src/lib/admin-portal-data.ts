/**
 * Apartment Admin portal data — configuration summary only.
 */
import { routes } from "@/config/routes";
import {
  getApartment,
  getApartmentStats,
  getBlocks,
  getFlats,
  getFlatsByBlock,
  getOwnersByFlat,
  getTenantsByFlat,
} from "@/lib/data";
import { getStaffRoster } from "@/lib/settings-data";
import type { Block, Flat } from "@/types";

export interface AdminDashboardSummary {
  apartmentName: string;
  blockCount: number;
  floorCount: number;
  flatCount: number;
  residentCount: number;
  inspectorCount: number;
  pendingConfigCount: number;
  pendingTasks: AdminPendingTask[];
}

export interface AdminPendingTask {
  id: string;
  label: string;
  href: string;
}

export interface AdminBlockSummary {
  id: string;
  name: string;
  code: string;
  floorCount: number;
  flatCount: number;
  flatsPerFloor: number;
  description: string;
  href: string;
  needsGeneration: boolean;
}

export interface GeneratedFloorPreview {
  floor: number;
  label: string;
  flatNumbers: string[];
}

export interface FlatAssignmentRow {
  flatId: string;
  flatNumber: string;
  blockName: string;
  occupancyStatus: Flat["occupancyStatus"];
  ownerName: string | null;
  tenantName: string | null;
  href: string;
}

export function getAdminDashboardSummary(): AdminDashboardSummary {
  const apartment = getApartment();
  const stats = getApartmentStats();
  const staff = getStaffRoster();
  const inspectorCount = staff.filter(
    (s) => s.roleId === "inspector" || s.roleId === "office_manager"
  ).length;
  const pendingTasks = getAdminPendingTasks();

  return {
    apartmentName: apartment.name,
    blockCount: stats.totalBlocks,
    floorCount: apartment.totalFloors ?? Math.max(...getBlocks().map((b) => b.floorCount), 0),
    flatCount: stats.totalFlats,
    residentCount: stats.totalResidents,
    inspectorCount,
    pendingConfigCount: pendingTasks.length,
    pendingTasks,
  };
}

export function getAdminPendingTasks(): AdminPendingTask[] {
  const tasks: AdminPendingTask[] = [];

  for (const block of getBlocks()) {
    const flatCount = getFlatsByBlock(block.id).length;
    if (flatCount === 0 && block.totalFlats > 0) {
      tasks.push({
        id: `generate-${block.id}`,
        label: `Generate flats for ${block.name}`,
        href: routes.dashboard.admin.blocks.detail(block.id),
      });
    }
  }

  const vacantWithoutOwner = getFlats().filter(
    (f) => f.occupancyStatus === "vacant" && getOwnersByFlat(f.id).length === 0
  );
  if (vacantWithoutOwner.length > 0) {
    tasks.push({
      id: "assign-vacant",
      label: `${vacantWithoutOwner.length} vacant flat(s) need owner assignment`,
      href: routes.dashboard.admin.residents,
    });
  }

  return tasks;
}

export function getAdminBlockSummaries(): AdminBlockSummary[] {
  return getBlocks().map((block) => {
    const flats = getFlatsByBlock(block.id);
    const flatsPerFloor =
      block.floorCount > 0 && flats.length > 0
        ? Math.round(flats.length / block.floorCount)
        : block.totalFlats > 0 && block.floorCount > 0
          ? Math.round(block.totalFlats / block.floorCount)
          : 0;

    return {
      id: block.id,
      name: block.name,
      code: block.code,
      floorCount: block.floorCount,
      flatCount: flats.length,
      flatsPerFloor,
      description: block.description,
      href: routes.dashboard.admin.blocks.detail(block.id),
      needsGeneration: flats.length === 0 && block.totalFlats > 0,
    };
  });
}

export function getBlockByIdOrThrow(blockId: string): Block {
  const block = getBlocks().find((b) => b.id === blockId);
  if (!block) throw new Error(`Block not found: ${blockId}`);
  return block;
}

export function getFlatsForFloor(blockId: string, floor: number): Flat[] {
  return getFlatsByBlock(blockId)
    .filter((f) => f.floor === floor)
    .sort((a, b) => a.flatNumber.localeCompare(b.flatNumber, undefined, { numeric: true }));
}

export function getFloorsForBlock(blockId: string): number[] {
  const block = getBlockByIdOrThrow(blockId);
  const existingFloors = new Set(getFlatsByBlock(blockId).map((f) => f.floor));
  if (existingFloors.size > 0) {
    return [...existingFloors].sort((a, b) => a - b);
  }
  return Array.from({ length: block.floorCount }, (_, i) => i + 1);
}

/** Preview flat numbers for the flat builder (e.g. 101–111, 201–211). */
export function previewGeneratedFlats(
  floorCount: number,
  flatsPerFloor: number,
  startOnFloor = 1
): GeneratedFloorPreview[] {
  return Array.from({ length: floorCount }, (_, i) => {
    const floor = i + 1;
    const base = floor * 100;
    const flatNumbers = Array.from({ length: flatsPerFloor }, (_, j) =>
      String(base + startOnFloor + j)
    );
    return {
      floor,
      label: `Floor ${floor}`,
      flatNumbers,
    };
  });
}

export function getFlatAssignmentRows(): FlatAssignmentRow[] {
  const blocks = getBlocks();
  return getFlats()
    .sort((a, b) => a.flatNumber.localeCompare(b.flatNumber, undefined, { numeric: true }))
    .map((flat) => {
      const block = blocks.find((b) => b.id === flat.blockId);
      const owner = getOwnersByFlat(flat.id).find((o) => o.isPrimary);
      const tenant = getTenantsByFlat(flat.id)[0];
      return {
        flatId: flat.id,
        flatNumber: flat.flatNumber,
        blockName: block?.name ?? flat.blockId,
        occupancyStatus: flat.occupancyStatus,
        ownerName: owner?.fullName ?? null,
        tenantName: tenant?.fullName ?? null,
        href: routes.dashboard.admin.flats.detail(flat.id),
      };
    });
}

export function getFlatByIdOrThrow(flatId: string): Flat {
  const flat = getFlats().find((f) => f.id === flatId);
  if (!flat) throw new Error(`Flat not found: ${flatId}`);
  return flat;
}

export const DEMO_BANK_DETAILS = {
  accountName: "Sylvan Shelter Apartment Owners Association",
  bankName: "State Bank of India",
  branch: "Gachibowli, Hyderabad",
  accountNumber: "XXXX XXXX 4521",
  ifsc: "SBIN0001234",
  accountType: "Current",
  gstNumber: "36AABCS1234F1Z5",
  panNumber: "AABCS1234F",
};
