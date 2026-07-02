/**
 * Finance module data layer (Phase 7E).
 * Society-wide financial aggregations — bills, payments, receipts, outstanding.
 */
import {
  enrichFollowUpFromRecord,
  getFollowUpRecords,
} from "@/lib/admin-data";
import {
  DEMO_REFERENCE_DATE,
  formatCurrency,
  getApartment,
  getBlockById,
  getBlocks,
  getDemoToday,
  getDemoTodayIso,
  getFlatById,
  getFlatsByBlock,
  getLastPaidPayment,
  getMaintenanceSummary,
  getOutstandingPayments,
  getOverduePayments,
  getPayments,
  getPaymentsByFlat,
  getPaymentsRecordedOn,
  getPrimaryOwner,
  getTenantsByFlat,
  getAllFlatsWithOwners,
} from "@/lib/data";

import type {
  BlockFinanceSummary,
  CommunityFinanceSummary,
  EnrichedFinancePayment,
  FollowUpRecord,
  OutstandingQueueItem,
  Payment,
} from "@/types";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function enrichPayment(payment: Payment): EnrichedFinancePayment {
  const flat = getFlatById(payment.flatId);
  const block = flat ? getBlockById(flat.blockId) : undefined;
  const tenant = getTenantsByFlat(payment.flatId)[0];
  const owner = getPrimaryOwner(payment.flatId);
  const resident = tenant ?? owner;

  return {
    ...payment,
    flatNumber: flat?.flatNumber ?? "—",
    blockId: flat?.blockId ?? "",
    blockName: block?.name ?? "—",
    floor: flat?.floor ?? 0,
    residentName: resident?.fullName ?? "Vacant",
  };
}

function daysBetween(fromIso: string, toIso: string): number {
  const from = new Date(fromIso);
  const to = new Date(toIso);
  return Math.max(0, Math.floor((to.getTime() - from.getTime()) / 86400000));
}

function computeDaysOverdue(payment: Payment): number {
  if (payment.status !== "overdue") return 0;
  return daysBetween(payment.dueDate, DEMO_REFERENCE_DATE);
}

function computeFlatOutstanding(flatId: string): {
  outstanding: number;
  daysOverdue: number;
  pendingAmount: number;
  overdueAmount: number;
} {
  const open = getPaymentsByFlat(flatId).filter(
    (p) => p.status === "pending" || p.status === "overdue"
  );
  const outstanding = open.reduce((s, p) => s + p.amount, 0);
  const overdueBills = open.filter((p) => p.status === "overdue");
  const pendingAmount = open
    .filter((p) => p.status === "pending")
    .reduce((s, p) => s + p.amount, 0);
  const overdueAmount = overdueBills.reduce((s, p) => s + p.amount, 0);
  const daysOverdue = overdueBills.length
    ? Math.max(...overdueBills.map(computeDaysOverdue))
    : open.length
      ? Math.max(
          ...open.map((p) =>
            daysBetween(p.dueDate, DEMO_REFERENCE_DATE)
          )
        )
      : 0;

  return { outstanding, daysOverdue, pendingAmount, overdueAmount };
}

function computePriorityScore(
  item: Omit<OutstandingQueueItem, "priorityScore" | "priorityTier">
): number {
  const today = getDemoTodayIso();
  let score = 0;

  // 1. Escalated — highest urgency
  if (item.followUpStatus === "escalated") score += 50000;

  // 2. Broken promise — promised date passed
  if (
    item.followUpStatus === "promised" &&
    item.promiseDate &&
    item.promiseDate < today
  ) {
    score += 40000;
  }

  // 3. High amount outstanding
  score += Math.min(item.outstanding, 100000) / 5;

  // 4. Long overdue
  score += item.daysOverdue * 200;

  // 5. Recent due — active promised / open (lower weight)
  if (item.followUpStatus === "promised" && item.promiseDate && item.promiseDate >= today) {
    score += 5000;
  }
  if (item.followUpStatus === "open") score += 2000;

  return score;
}

function computePriorityTier(
  item: Omit<OutstandingQueueItem, "priorityScore" | "priorityTier">
): OutstandingQueueItem["priorityTier"] {
  const today = getDemoTodayIso();
  if (item.followUpStatus === "escalated") return "escalated";
  if (
    item.followUpStatus === "promised" &&
    item.promiseDate &&
    item.promiseDate < today
  ) {
    return "broken_promise";
  }
  if (item.outstanding >= 2500) return "high_amount";
  if (item.daysOverdue >= 14) return "long_overdue";
  return "recent_due";
}

function buildOutstandingItemFromFlat(
  flatId: string,
  followUp: FollowUpRecord | null
): OutstandingQueueItem | null {
  const flat = getFlatById(flatId);
  if (!flat || flat.occupancyStatus === "vacant") return null;

  const { outstanding, daysOverdue } = computeFlatOutstanding(flatId);

  const block = getBlockById(flat.blockId);
  const tenant = getTenantsByFlat(flatId)[0];
  const owner = getPrimaryOwner(flatId);
  const resident = tenant ?? owner;
  const lastPaid = getLastPaidPayment(getPaymentsByFlat(flatId));
  const enriched = followUp ? enrichFollowUpFromRecord(followUp) : null;

  const item: Omit<OutstandingQueueItem, "priorityScore" | "priorityTier"> = {
    id: followUp?.id ?? `outstanding-${flatId}`,
    flatId,
    flatNumber: flat.flatNumber,
    blockId: flat.blockId,
    blockName: block?.name ?? "—",
    floor: flat.floor,
    residentName: resident?.fullName ?? "—",
    residentPhone: resident?.phone ?? owner?.phone ?? "",
    outstanding: followUp?.amountPending ?? outstanding,
    daysOverdue: followUp?.daysOverdue ?? daysOverdue,
    lastPayment: lastPaid?.paidDate
      ? {
          period: lastPaid.period,
          amount: lastPaid.amount,
          paidDate: lastPaid.paidDate,
        }
      : null,
    lastContactAt: followUp?.lastContactAt ?? null,
    lastContactMethod: followUp?.lastContactMethod ?? null,
    lastOutcome: followUp?.lastOutcome ?? null,
    promiseDate: followUp?.nextFollowUpDate ?? null,
    followUpStatus: followUp?.status ?? null,
    followUpId: followUp?.id ?? null,
  };

  return {
    ...item,
    priorityScore: computePriorityScore(item),
    priorityTier: computePriorityTier(item),
  };
}

export function getOutstandingQueue(options?: {
  blockId?: string;
  search?: string;
}): OutstandingQueueItem[] {
  const followUpByFlat = new Map(
    getFollowUpRecords().map((f) => [f.flatId, f])
  );

  const items: OutstandingQueueItem[] = [];

  for (const { flat } of getAllFlatsWithOwners()) {
    if (flat.occupancyStatus === "vacant") continue;
    if (options?.blockId && flat.blockId !== options.blockId) continue;

    const row = buildOutstandingItemFromFlat(
      flat.id,
      followUpByFlat.get(flat.id) ?? null
    );
    if (row) items.push(row);
  }

  items.sort((a, b) => {
    const aPaid = a.outstanding <= 0;
    const bPaid = b.outstanding <= 0;
    if (aPaid !== bPaid) return aPaid ? 1 : -1;
    return b.priorityScore - a.priorityScore;
  });

  if (options?.search?.trim()) {
    const q = options.search.toLowerCase();
    return items.filter(
      (i) =>
        i.flatNumber.includes(q) ||
        i.residentName.toLowerCase().includes(q) ||
        i.blockName.toLowerCase().includes(q)
    );
  }

  return items;
}

function buildPaymentTrend(flatIds?: Set<string>): CommunityFinanceSummary["paymentTrend"] {
  const allPayments = getPayments().filter(
    (p) => !flatIds || flatIds.has(p.flatId)
  );

  const byMonth = new Map<string, { collected: number; billed: number }>();

  for (const payment of allPayments) {
    const match = payment.period.match(/(\w+)\s+(\d{4})/);
    if (!match) continue;
    const key = `${match[2]}-${String(MONTH_NAMES.indexOf(match[1]) + 1).padStart(2, "0")}`;
    const entry = byMonth.get(key) ?? { collected: 0, billed: 0 };
    entry.billed += payment.amount;
    if (payment.status === "paid") entry.collected += payment.amount;
    byMonth.set(key, entry);
  }

  return [...byMonth.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([monthKey, data]) => {
      const [year, month] = monthKey.split("-");
      const monthLabel = `${MONTH_NAMES[parseInt(month, 10) - 1]} ${year}`;
      const outstanding = Math.max(0, data.billed - data.collected);
      const collectionRate =
        data.billed > 0
          ? Math.round((data.collected / data.billed) * 1000) / 10
          : 100;
      return {
        month: monthLabel,
        monthKey,
        collected: data.collected,
        outstanding,
        collectionRate,
      };
    });
}

function getBlockFinancials(blockId: string) {
  const flats = getFlatsByBlock(blockId);
  const flatIds = new Set(flats.map((f) => f.id));
  const open = getOutstandingPayments().filter((p) => flatIds.has(p.flatId));
  const pendingAmount = open
    .filter((p) => p.status === "pending")
    .reduce((s, p) => s + p.amount, 0);
  const overdueAmount = open
    .filter((p) => p.status === "overdue")
    .reduce((s, p) => s + p.amount, 0);
  const outstanding = pendingAmount + overdueAmount;
  const overdueCount = new Set(
    getOverduePayments()
      .filter((p) => flatIds.has(p.flatId))
      .map((p) => p.flatId)
  ).size;

  const billable = flats.filter((f) => f.occupancyStatus !== "vacant");
  const paidFlats = billable.filter(
    (f) => computeFlatOutstanding(f.id).outstanding === 0
  ).length;
  const collectionRate =
    billable.length > 0
      ? Math.round((paidFlats / billable.length) * 1000) / 10
      : 100;

  return {
    totalFlats: flats.length,
    collectionRate,
    outstanding,
    pendingAmount,
    overdueAmount,
    overdueCount,
  };
}

export function getCommunityFinanceSummary(): CommunityFinanceSummary {
  const apartment = getApartment();
  const maintenance = getMaintenanceSummary();
  const todayIso = getDemoTodayIso();
  const todayPayments = getPaymentsRecordedOn(todayIso).map(enrichPayment);
  const todayCollection = todayPayments.reduce((s, p) => s + p.amount, 0);
  const monthPayments = getFinancePaymentsWindow("month");
  const monthlyCollection = monthPayments.reduce((s, p) => s + p.amount, 0);

  const pendingAmount = getOutstandingPayments()
    .filter((p) => p.status === "pending")
    .reduce((s, p) => s + p.amount, 0);
  const overdueAmount = getOutstandingPayments()
    .filter((p) => p.status === "overdue")
    .reduce((s, p) => s + p.amount, 0);

  const paymentTrend = buildPaymentTrend();
  const bestMonth = paymentTrend.length
    ? [...paymentTrend].sort((a, b) => b.collectionRate - a.collectionRate)[0]
    : null;

  const blockSummaries = getBlocks().map((block) => ({
    blockId: block.id,
    blockName: block.name,
    ...getBlockFinancials(block.id),
  }));

  const highestOutstandingBlock = blockSummaries
    .filter((b) => b.totalFlats > 0)
    .sort((a, b) => b.outstanding - a.outstanding)[0];

  const recentPayments = getPayments()
    .filter((p) => p.status === "paid" && p.paidDate)
    .sort(
      (a, b) =>
        new Date(b.paidDate!).getTime() - new Date(a.paidDate!).getTime()
    )
    .slice(0, 8)
    .map(enrichPayment);

  const overdueFlatCount = new Set(
    getOverduePayments().map((p) => p.flatId)
  ).size;

  const financialHealth =
    maintenance.collectionRate >= 95 && overdueFlatCount === 0
      ? "excellent"
      : maintenance.collectionRate >= 90 && overdueFlatCount <= 3
        ? "good"
        : maintenance.collectionRate >= 80
          ? "fair"
          : "needs_attention";

  return {
    apartmentName: apartment.name,
    billingMonth: maintenance.month,
    totalCollected: maintenance.totalCollected,
    totalOutstanding: maintenance.totalOutstanding,
    collectionRate: maintenance.collectionRate,
    monthlyCollection,
    pendingAmount,
    overdueAmount,
    todayCollection,
    todayPaymentCount: todayPayments.length,
    financialHealth,
    recentPayments,
    paymentTrend,
    bestMonth: bestMonth ?? null,
    highestOutstandingBlock: highestOutstandingBlock
      ? {
          blockId: highestOutstandingBlock.blockId,
          blockName: highestOutstandingBlock.blockName,
          outstanding: highestOutstandingBlock.outstanding,
        }
      : null,
    openFollowUpCount: getFollowUpRecords().length,
    overdueFlatCount,
    blockSummaries,
  };
}

export function getBlockFinanceSummary(blockId: string): BlockFinanceSummary | null {
  const block = getBlockById(blockId);
  if (!block) return null;

  const flats = getFlatsByBlock(blockId);
  const flatIds = new Set(flats.map((f) => f.id));
  const financials = getBlockFinancials(blockId);
  const maintenance = getMaintenanceSummary();

  const blockPayments = getPayments()
    .filter((p) => flatIds.has(p.flatId) && p.status === "paid")
    .reduce((s, p) => s + p.amount, 0);

  const recentPayments = getPayments()
    .filter((p) => flatIds.has(p.flatId) && p.status === "paid" && p.paidDate)
    .sort(
      (a, b) =>
        new Date(b.paidDate!).getTime() - new Date(a.paidDate!).getTime()
    )
    .slice(0, 6)
    .map(enrichPayment);

  const topDefaulters = getOutstandingQueue({ blockId }).slice(0, 5);

  return {
    blockId,
    blockName: block.name,
    billingMonth: maintenance.month,
    totalFlats: flats.length,
    billableFlats: flats.filter((f) => f.occupancyStatus !== "vacant").length,
    collectionRate: financials.collectionRate,
    totalCollected: blockPayments,
    outstanding: financials.outstanding,
    pendingAmount: financials.pendingAmount,
    overdueAmount: financials.overdueAmount,
    overdueCount: financials.overdueCount,
    paymentTrend: buildPaymentTrend(flatIds),
    topDefaulters,
    recentPayments,
  };
}

export function getFinancePaymentsWindow(
  window: "today" | "week" | "month" | "all"
): EnrichedFinancePayment[] {
  const today = getDemoToday();
  const todayIso = getDemoTodayIso();

  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  const weekStartIso = weekStart.toISOString().slice(0, 10);

  const monthPrefix = todayIso.slice(0, 7);

  let list = getPayments().filter((p) => p.status === "paid" && p.paidDate);

  if (window === "today") {
    list = list.filter((p) => p.paidDate === todayIso);
  } else if (window === "week") {
    list = list.filter(
      (p) => p.paidDate! >= weekStartIso && p.paidDate! <= todayIso
    );
  } else if (window === "month") {
    list = list.filter((p) => p.paidDate!.startsWith(monthPrefix));
  }

  return list
    .sort(
      (a, b) =>
        new Date(b.paidDate!).getTime() - new Date(a.paidDate!).getTime()
    )
    .map(enrichPayment);
}

export function getFinanceReceipts(): EnrichedFinancePayment[] {
  return getPayments()
    .filter((p) => p.status === "paid" && p.receiptNumber)
    .sort(
      (a, b) =>
        new Date(b.paidDate!).getTime() - new Date(a.paidDate!).getTime()
    )
    .map(enrichPayment);
}

export function getFinancePaymentHistory(): EnrichedFinancePayment[] {
  return getPayments()
    .filter((p) => p.status === "paid")
    .sort(
      (a, b) =>
        new Date(b.paidDate!).getTime() - new Date(a.paidDate!).getTime()
    )
    .map(enrichPayment);
}

export function buildStatementPreview(options: {
  scope: "flat" | "block" | "apartment";
  flatId?: string;
  blockId?: string;
  dateFrom?: string;
  dateTo?: string;
}): string {
  const lines: string[] = [];
  const maintenance = getMaintenanceSummary();

  if (options.scope === "apartment") {
    const summary = getCommunityFinanceSummary();
    lines.push(
      `${summary.apartmentName} — Community Statement`,
      `Billing cycle: ${maintenance.month}`,
      "",
      `Total collected: ${formatCurrency(summary.totalCollected)}`,
      `Outstanding: ${formatCurrency(summary.totalOutstanding)}`,
      `Collection rate: ${summary.collectionRate}%`,
      `Pending: ${formatCurrency(summary.pendingAmount)}`,
      `Overdue: ${formatCurrency(summary.overdueAmount)}`
    );
  } else if (options.scope === "block" && options.blockId) {
    const block = getBlockFinanceSummary(options.blockId);
    if (block) {
      lines.push(
        `${block.blockName} — Block Statement`,
        `Billing cycle: ${block.billingMonth}`,
        "",
        `Collection rate: ${block.collectionRate}%`,
        `Outstanding: ${formatCurrency(block.outstanding)}`,
        `Overdue flats: ${block.overdueCount}`
      );
    }
  } else if (options.scope === "flat" && options.flatId) {
    const flat = getFlatById(options.flatId);
    const { outstanding } = computeFlatOutstanding(options.flatId);
    lines.push(
      `Flat ${flat?.flatNumber ?? options.flatId} — Statement`,
      "",
      `Outstanding: ${formatCurrency(outstanding)}`
    );
  }

  if (options.dateFrom && options.dateTo) {
    lines.push("", `Period: ${options.dateFrom} to ${options.dateTo}`);
  }

  return lines.join("\n");
}

export { enrichPayment, formatCurrency };
