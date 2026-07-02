/**
 * Reports & Analytics data layer (Phase 7H).
 * Aggregates from finance, assets, communication, and core data — no duplicate logic.
 */
import { getCommunicationSummary } from "@/lib/communication-data";
import { getCommunityAssets } from "@/lib/asset-data";
import {
  getBlockFinanceSummary,
  getCommunityFinanceSummary,
} from "@/lib/finance-data";
import {
  formatCurrency,
  formatDate,
  getAllTenants,
  getApartmentStats,
  getBlockById,
  getBlocks,
  getDemoToday,
  getDemoTodayIso,
  getFlatById,
  getFlats,
  getFlatsByBlock,
  getMaintenanceStats,
  getMaintenanceSummary,
  getNoticeCategoryLabel,
  getNotices,
  getOverduePayments,
  getOutstandingPayments,
  getPayments,
  getResidentTableRows,
} from "@/lib/data";
import type {
  CollectionReportData,
  CommunicationReportData,
  AssetReportData,
  MaintenanceReportData,
  MovementReportData,
  OccupancyReportData,
  ReportDrillRow,
  ReportScope,
  ReportScopeContext,
} from "@/types";

function filterFlats(scope: ReportScope) {
  let flats = getFlats();
  if (scope.blockId) flats = flats.filter((f) => f.blockId === scope.blockId);
  if (scope.floor != null) flats = flats.filter((f) => f.floor === scope.floor);
  if (scope.flatId) flats = flats.filter((f) => f.id === scope.flatId);
  return flats;
}

function flatIdsInScope(scope: ReportScope): Set<string> {
  return new Set(filterFlats(scope).map((f) => f.id));
}

export function parseReportScope(params: {
  block?: string;
  floor?: string;
  flatId?: string;
}): ReportScope {
  const blocks = getBlocks();
  const blockId =
    params.block && params.block !== "all"
      ? params.block
      : blocks[0]?.id ?? "block-a";
  return { blockId };
}

export type ReportPeriodFilter = "all" | "week" | "month";

export function parseReportQuery(params: {
  block?: string;
  period?: string;
}): { scope: ReportScope; period: ReportPeriodFilter } {
  const scope = parseReportScope(params);
  const period: ReportPeriodFilter =
    params.period === "week" || params.period === "month"
      ? params.period
      : "all";
  return { scope, period };
}

function filterPaymentsByPeriod(
  payments: ReturnType<typeof getPayments>,
  period: ReportPeriodFilter
) {
  if (period === "all") return payments;

  const today = getDemoToday();
  const todayIso = getDemoTodayIso();

  if (period === "month") {
    const prefix = todayIso.slice(0, 7);
    return payments.filter((p) => {
      const date = p.paidDate ?? p.dueDate;
      return date.startsWith(prefix);
    });
  }

  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - weekStart.getDay());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  const start = weekStart.toISOString().slice(0, 10);
  const end = weekEnd.toISOString().slice(0, 10);

  return payments.filter((p) => {
    const date = p.paidDate ?? p.dueDate;
    return date >= start && date <= end;
  });
}

function buildBlockFlatRows(blockId: string): ReportDrillRow[] {
  const flats = getFlatsByBlock(blockId);
  const rows = getResidentTableRows().filter((r) =>
    flats.some((f) => f.id === r.id)
  );

  return rows.map((row) => ({
    id: row.id,
    label: `Flat ${row.flatNumber}`,
    sublabel: row.residentName,
    value:
      row.maintenanceStatus === "paid"
        ? "Paid"
        : row.maintenanceStatus === "vacant"
          ? "Vacant"
          : formatCurrency(row.pendingAmount),
    highlight: row.maintenanceStatus === "overdue",
  }));
}

export function buildReportScopeContext(
  scope: ReportScope,
  reportBasePath: string
): ReportScopeContext {
  const blockId = scope.blockId ?? getBlocks()[0]?.id ?? "block-a";
  const block = getBlockById(blockId);

  return {
    scope: { blockId },
    label: block?.name ?? "Block",
    breadcrumbs: [
      {
        label: block?.name ?? "Block",
        href: `${reportBasePath}?block=${blockId}`,
      },
    ],
  };
}

export function getReportsHubSummary() {
  const stats = getApartmentStats();
  const finance = getCommunityFinanceSummary();
  const maintenance = getMaintenanceSummary();
  const comms = getCommunicationSummary();
  const assets = getCommunityAssets();

  return {
    collectionRate: finance.collectionRate,
    totalOutstanding: finance.totalOutstanding,
    occupancyRate: Math.round((stats.occupiedFlats / stats.totalFlats) * 1000) / 10,
    overdueFlats: new Set(getOverduePayments().map((p) => p.flatId)).size,
    publishedNotices: comms.publishedCount,
    assetAlerts: assets.filter(
      (a) => a.status === "amc_overdue" || a.status === "service_due_soon"
    ).length,
    billingMonth: maintenance.month,
  };
}

export function getCollectionReportData(
  scope: ReportScope,
  basePath: string,
  period: ReportPeriodFilter = "all"
): CollectionReportData {
  const blockId = scope.blockId ?? getBlocks()[0]?.id ?? "block-a";
  const blockScope = { blockId };
  const context = buildReportScopeContext(blockScope, basePath);
  const block = getBlockFinanceSummary(blockId);
  const ids = flatIdsInScope(blockScope);
  const scopedPayments = filterPaymentsByPeriod(
    getPayments().filter((p) => ids.has(p.flatId)),
    period
  );

  const paid = scopedPayments.filter((p) => p.status === "paid");
  const open = scopedPayments.filter(
    (p) => p.status === "pending" || p.status === "overdue"
  );
  const billed = scopedPayments.reduce((s, p) => s + p.amount, 0);
  const collected = paid.reduce((s, p) => s + p.amount, 0);
  const rate =
    period === "all" && block
      ? block.collectionRate
      : billed > 0
        ? Math.round((collected / billed) * 1000) / 10
        : 100;

  return {
    context,
    collectionRate: rate,
    totalCollected:
      period === "all" && block ? block.totalCollected : collected,
    totalOutstanding:
      period === "all" && block
        ? block.outstanding
        : open.reduce((s, p) => s + p.amount, 0),
    billingMonth: block?.billingMonth ?? getMaintenanceSummary().month,
    paymentTrend: block?.paymentTrend ?? [],
    blockRows: buildBlockFlatRows(blockId),
  };
}

export function getFinancialReportData(
  scope: ReportScope,
  basePath: string,
  period: ReportPeriodFilter = "all"
) {
  return getCollectionReportData(scope, basePath, period);
}

export function getOccupancyReportData(
  scope: ReportScope,
  basePath: string
): OccupancyReportData {
  const blockId = scope.blockId ?? getBlocks()[0]?.id ?? "block-a";
  const blockScope = { blockId };
  const context = buildReportScopeContext(blockScope, basePath);
  const flats = filterFlats(blockScope);

  const occupied = flats.filter((f) => f.occupancyStatus !== "vacant").length;
  const vacant = flats.filter((f) => f.occupancyStatus === "vacant").length;
  const owner = flats.filter((f) => f.occupancyStatus === "owner_occupied").length;
  const tenant = flats.filter((f) => f.occupancyStatus === "tenant_occupied").length;
  const rate =
    flats.length > 0 ? Math.round((occupied / flats.length) * 1000) / 10 : 0;

  const flatRows = flats.map((flat) => {
    const row = getResidentTableRows().find((r) => r.id === flat.id);
    return {
      id: flat.id,
      label: `Flat ${flat.flatNumber}`,
      sublabel: row?.residentName ?? "Vacant",
      value:
        flat.occupancyStatus === "owner_occupied"
          ? "Owner"
          : flat.occupancyStatus === "tenant_occupied"
            ? "Rent"
            : "Vacant",
      highlight: flat.occupancyStatus === "vacant",
    };
  });

  return {
    context,
    totalFlats: flats.length,
    occupiedFlats: occupied,
    vacantFlats: vacant,
    ownerOccupied: owner,
    tenantOccupied: tenant,
    occupancyRate: rate,
    floorRows: [],
    flatRows,
  };
}

export function getMaintenanceReportData(
  scope: ReportScope,
  basePath: string
): MaintenanceReportData {
  const blockId = scope.blockId ?? getBlocks()[0]?.id ?? "block-a";
  const blockScope = { blockId };
  const context = buildReportScopeContext(blockScope, basePath);
  const ids = flatIdsInScope(blockScope);
  const outstanding = getOutstandingPayments().filter((p) => ids.has(p.flatId));
  const overdue = getOverduePayments().filter((p) => ids.has(p.flatId));
  const paid = getPayments().filter((p) => ids.has(p.flatId) && p.status === "paid");

  const flatRows = getResidentTableRows()
    .filter((r) => ids.has(r.id))
    .filter((r) => r.maintenanceStatus !== "paid" && r.maintenanceStatus !== "vacant")
    .map((r) => ({
      id: r.id,
      label: `Flat ${r.flatNumber}`,
      sublabel: r.residentName,
      value: formatCurrency(r.pendingAmount),
      highlight: r.maintenanceStatus === "overdue",
    }))
    .sort((a, b) => (a.highlight === b.highlight ? 0 : a.highlight ? -1 : 1));

  return {
    context,
    outstanding: outstanding.reduce((s, p) => s + p.amount, 0),
    overdueCount: new Set(overdue.map((p) => p.flatId)).size,
    pendingCount: outstanding.filter((p) => p.status === "pending").length,
    paidCount: paid.length,
    flatRows,
  };
}

export function getCommunicationReportData(
  scope: ReportScope,
  basePath: string
): CommunicationReportData {
  const blockId = scope.blockId ?? getBlocks()[0]?.id ?? "block-a";
  const context = buildReportScopeContext({ blockId }, basePath);
  const summary = getCommunicationSummary();
  const notices = getNotices();

  return {
    context,
    publishedCount: summary.publishedCount,
    draftCount: summary.draftCount,
    emergencyCount: summary.emergencyCount,
    byCategory: notices.slice(0, 5).map((n) => ({
      id: n.id,
      label: n.title,
      sublabel: getNoticeCategoryLabel(n.category),
      value: formatDate(n.publishedAt),
    })),
  };
}

export function getAssetReportData(
  scope: ReportScope,
  basePath: string
): AssetReportData {
  const blockId = scope.blockId ?? getBlocks()[0]?.id ?? "block-a";
  const context = buildReportScopeContext({ blockId }, basePath);
  const assets = getCommunityAssets().filter(
    (a) => a.scope === "community" || a.blockId === blockId
  );

  return {
    context,
    totalAssets: assets.length,
    amcOverdue: assets.filter((a) => a.status === "amc_overdue").length,
    serviceDueSoon: assets.filter((a) => a.status === "service_due_soon").length,
    assetRows: assets.map((a) => ({
      id: a.id,
      label: a.name,
      sublabel: a.vendor,
      value: a.status.replace(/_/g, " "),
      highlight: a.status === "amc_overdue",
    })),
  };
}

export function getMovementReportData(
  scope: ReportScope,
  basePath: string
): MovementReportData {
  const blockId = scope.blockId ?? getBlocks()[0]?.id ?? "block-a";
  const blockScope = { blockId };
  const context = buildReportScopeContext(blockScope, basePath);
  const ids = flatIdsInScope(blockScope);
  const today = getDemoToday();
  const lookback = new Date(today);
  lookback.setDate(today.getDate() - 90);
  const lookbackIso = lookback.toISOString().slice(0, 10);
  const todayIso = getDemoTodayIso();

  const moveIns: ReportDrillRow[] = [];
  const moveOuts: ReportDrillRow[] = [];

  for (const tenant of getAllTenants()) {
    if (!ids.has(tenant.flatId)) continue;
    const flat = getFlatById(tenant.flatId);
    if (!flat) continue;

    if (
      tenant.leaseStartDate >= lookbackIso &&
      tenant.leaseStartDate <= todayIso &&
      tenant.isActive
    ) {
      moveIns.push({
        id: `move-in-${tenant.id}`,
        label: `Flat ${flat.flatNumber}`,
        sublabel: tenant.fullName,
        value: formatDate(tenant.leaseStartDate),
      });
    }

    const end = tenant.leaseEndDate;
    if (end >= lookbackIso && end <= todayIso && (!tenant.isActive || end <= todayIso)) {
      moveOuts.push({
        id: `move-out-${tenant.id}`,
        label: `Flat ${flat.flatNumber}`,
        sublabel: tenant.fullName,
        value: formatDate(end),
      });
    }
  }

  moveIns.sort((a, b) => String(b.value).localeCompare(String(a.value)));
  moveOuts.sort((a, b) => String(b.value).localeCompare(String(a.value)));

  return { context, moveIns, moveOuts };
}

export { getBlocks };
