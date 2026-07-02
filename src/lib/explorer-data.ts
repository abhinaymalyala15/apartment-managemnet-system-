/**
 * Community Explorer data layer (Phase 7C).
 * Lazy-load friendly accessors — only fetch branches when expanded.
 */
import type { OccupancyStatus } from "@/types";
import {
  formatCurrency,
  getApartment,
  getBlockById,
  getBlocks,
  getDemoTodayIso,
  getFlatById,
  getFlatsByBlock,
  getMaintenanceSummary,
  getNotices,
  getOverduePayments,
  getOutstandingPayments,
  getResidentTableRows,
  getServices,
  isServiceToday,
} from "@/lib/data";
import {
  enrichFollowUpFromRecord,
  getFollowUpRecords,
} from "@/lib/admin-data";

export type FlatBillStatus = "paid" | "pending" | "overdue" | "vacant";

export interface ExplorerBlockMeta {
  id: string;
  name: string;
  code: string;
  floorCount: number;
  flatCount: number;
  overdueCount: number;
  vacantCount: number;
}

export interface ExplorerFloorMeta {
  blockId: string;
  floor: number;
  flatCount: number;
  overdueCount: number;
}

export interface ExplorerFlatNode {
  id: string;
  flatNumber: string;
  blockId: string;
  floor: number;
  residentName: string;
  billStatus: FlatBillStatus;
  occupancyStatus: OccupancyStatus;
  occupancyLabel: "Owner" | "Tenant" | "Vacant";
}

export interface ExplorerPath {
  blockId?: string;
  floor?: number;
  flatId?: string;
}

export interface BlockDashboardSummary {
  blockId: string;
  blockName: string;
  totalFlats: number;
  occupiedFlats: number;
  vacantFlats: number;
  collectionRate: number;
  outstanding: number;
  overdueCount: number;
  upcomingServices: ReturnType<typeof getServices>;
  recentMoveIns: Array<{
    flatNumber: string;
    residentName: string;
    date: string;
    flatId: string;
  }>;
  recentNotices: ReturnType<typeof getNotices>;
  followUps: ReturnType<typeof enrichFollowUpFromRecord>[];
}

export interface FloorViewFlat {
  id: string;
  flatNumber: string;
  residentName: string;
  occupancyLabel: "Owner" | "Tenant" | "Vacant";
  billStatus: FlatBillStatus;
  billStatusLabel: string;
  pendingAmount: number;
}

export interface FloorViewData {
  blockId: string;
  blockName: string;
  floor: number;
  flats: FloorViewFlat[];
}

const residentRowMap = () => {
  const map = new Map<string, ReturnType<typeof getResidentTableRows>[number]>();
  for (const row of getResidentTableRows()) {
    map.set(row.id, row);
  }
  return map;
};

function getOccupancyLabel(
  status: OccupancyStatus
): "Owner" | "Tenant" | "Vacant" {
  const labels = {
    vacant: "Vacant" as const,
    owner_occupied: "Owner" as const,
    tenant_occupied: "Tenant" as const,
  };
  return labels[status];
}

function getBillStatusLabel(status: FlatBillStatus): string {
  const labels: Record<FlatBillStatus, string> = {
    paid: "Paid",
    pending: "Due soon",
    overdue: "Overdue",
    vacant: "Vacant",
  };
  return labels[status];
}

export function flatToExplorerNode(
  flat: ReturnType<typeof getFlatsByBlock>[number]
): ExplorerFlatNode {
  const row = residentRowMap().get(flat.id);
  return {
    id: flat.id,
    flatNumber: flat.flatNumber,
    blockId: flat.blockId,
    floor: flat.floor,
    residentName: row?.residentName ?? "Vacant",
    billStatus: row?.maintenanceStatus ?? "vacant",
    occupancyStatus: flat.occupancyStatus,
    occupancyLabel: getOccupancyLabel(flat.occupancyStatus),
  };
}

export function getExplorerApartmentName(): string {
  return getApartment().name;
}

export function getExplorerBlockList(): ExplorerBlockMeta[] {
  return getBlocks().map((block) => {
    const flats = getFlatsByBlock(block.id);
    const overdueIds = new Set(
      getOverduePayments()
        .filter((p) => flats.some((f) => f.id === p.flatId))
        .map((p) => p.flatId)
    );
    return {
      id: block.id,
      name: block.name,
      code: block.code,
      floorCount: block.floorCount,
      flatCount: flats.length,
      overdueCount: overdueIds.size,
      vacantCount: flats.filter((f) => f.occupancyStatus === "vacant").length,
    };
  });
}

/** Floors for a block — call only when block node is expanded. */
export function getExplorerFloorsForBlock(blockId: string): ExplorerFloorMeta[] {
  const flats = getFlatsByBlock(blockId);
  const floorSet = new Set(flats.map((f) => f.floor));
  const floorsFromBlock = getBlockById(blockId)?.floorCount ?? 0;

  const floors: number[] =
    floorSet.size > 0
      ? [...floorSet].sort((a, b) => a - b)
      : Array.from({ length: floorsFromBlock }, (_, i) => i + 1);

  return floors.map((floor) => {
    const floorFlats = flats.filter((f) => f.floor === floor);
    const overdue = floorFlats.filter((f) => {
      const row = residentRowMap().get(f.id);
      return row?.maintenanceStatus === "overdue";
    }).length;
    return {
      blockId,
      floor,
      flatCount: floorFlats.length,
      overdueCount: overdue,
    };
  });
}

/** Flats for a floor — call only when floor node is expanded. */
export function getExplorerFlatsForFloor(
  blockId: string,
  floor: number
): ExplorerFlatNode[] {
  return getFlatsByBlock(blockId)
    .filter((f) => f.floor === floor)
    .sort((a, b) => a.flatNumber.localeCompare(b.flatNumber))
    .map(flatToExplorerNode);
}

export function getExplorerPathForFlat(flatId: string): ExplorerPath | null {
  const flat = getFlatById(flatId);
  if (!flat) return null;
  return {
    blockId: flat.blockId,
    floor: flat.floor,
    flatId: flat.id,
  };
}

export function getExplorerPathForSearchResult(
  kind: "block" | "floor" | "flat" | "person",
  blockId?: string,
  floor?: number,
  flatId?: string
): ExplorerPath | null {
  if (flatId) return getExplorerPathForFlat(flatId);
  if (kind === "floor" && blockId && floor != null) {
    return { blockId, floor };
  }
  if (kind === "block" && blockId) {
    return { blockId };
  }
  return null;
}

export function getBlockDashboardSummary(
  blockId: string
): BlockDashboardSummary | null {
  const block = getBlockById(blockId);
  if (!block) return null;

  const flats = getFlatsByBlock(blockId);
  const rows = residentRowMap();
  const vacantFlats = flats.filter((f) => f.occupancyStatus === "vacant").length;
  const occupiedFlats = flats.length - vacantFlats;
  const billable = flats.filter((f) => f.occupancyStatus !== "vacant");
  const paidCount = billable.filter(
    (f) => rows.get(f.id)?.maintenanceStatus === "paid"
  ).length;
  const collectionRate =
    billable.length > 0
      ? Math.round((paidCount / billable.length) * 1000) / 10
      : 100;

  const flatIds = new Set(flats.map((f) => f.id));
  const outstanding = getOutstandingPayments()
    .filter((p) => flatIds.has(p.flatId))
    .reduce((s, p) => s + p.amount, 0);

  const overdueCount = new Set(
    getOverduePayments()
      .filter((p) => flatIds.has(p.flatId))
      .map((p) => p.flatId)
  ).size;

  const todayIso = getDemoTodayIso();
  const upcomingServices = getServices()
    .filter((s) => s.status === "scheduled" && s.scheduledDate >= todayIso)
    .slice(0, 5);

  const blockFlatIdSet = flatIds;
  const followUps = getFollowUpRecords()
    .filter((f) => blockFlatIdSet.has(f.flatId))
    .map(enrichFollowUpFromRecord)
    .slice(0, 5);

  const recentMoveIns =
    flats.length > 0
      ? [
          {
            flatId: "flat-503",
            flatNumber: "503",
            residentName: "Vikram Reddy",
            date: "2025-06-28",
          },
        ].filter((m) => blockFlatIdSet.has(m.flatId))
      : [];

  return {
    blockId,
    blockName: block.name,
    totalFlats: flats.length,
    occupiedFlats,
    vacantFlats,
    collectionRate,
    outstanding,
    overdueCount,
    upcomingServices,
    recentMoveIns,
    recentNotices: getNotices().slice(0, 3),
    followUps,
  };
}

export function getFloorViewData(
  blockId: string,
  floor: number
): FloorViewData | null {
  const block = getBlockById(blockId);
  if (!block) return null;

  const rows = residentRowMap();
  const flats = getFlatsByBlock(blockId)
    .filter((f) => f.floor === floor)
    .sort((a, b) => a.flatNumber.localeCompare(b.flatNumber))
    .map((flat) => {
      const row = rows.get(flat.id);
      const billStatus = row?.maintenanceStatus ?? "vacant";
      return {
        id: flat.id,
        flatNumber: flat.flatNumber,
        residentName: row?.residentName ?? "Vacant",
        occupancyLabel: getOccupancyLabel(flat.occupancyStatus),
        billStatus,
        billStatusLabel: getBillStatusLabel(billStatus),
        pendingAmount: row?.pendingAmount ?? 0,
      };
    });

  return {
    blockId,
    blockName: block.name,
    floor,
    flats,
  };
}

export function getDefaultExpandedNodes(totalFlats: number): string[] {
  const blocks = getExplorerBlockList();
  const firstBlock = blocks.find((b) => b.flatCount > 0);
  if (!firstBlock) return ["apt"];

  if (totalFlats <= 100) {
    return [
      "apt",
      `block:${firstBlock.id}`,
      `floor:${firstBlock.id}:1`,
    ];
  }
  return ["apt", `block:${firstBlock.id}`];
}

export { getBillStatusLabel, formatCurrency };
