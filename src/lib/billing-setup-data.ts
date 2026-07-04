/**
 * Admin billing setup — per-flat maintenance and other charges.
 */
import billingSetupData from "@/data/billing-flat-setup.json";
import maintenanceConfigData from "@/data/maintenance-config.json";
import {
  formatCurrency,
  getBlockById,
  getFlats,
  getOutstandingPayments,
  getPrimaryOwner,
  getDemoTodayIso,
} from "@/lib/data";
import type {
  BillingSetupConfig,
  FlatBillingAssignment,
  FlatBillingRow,
  FlatBillingStatus,
} from "@/types";

const stored = billingSetupData as BillingSetupConfig;
const maintenanceConfig = maintenanceConfigData as { maintenanceRatePerSqft: number };

function deriveStatus(flatId: string, amount: number): FlatBillingStatus {
  const outstanding = getOutstandingPayments().find(
    (p) => p.flatId === flatId && p.type === "maintenance" && p.amount === amount
  );
  if (outstanding?.status === "overdue") return "overdue";
  if (outstanding) return "pending";
  return "paid";
}

function buildDefaultAssignment(flatId: string, areaSqft: number): FlatBillingAssignment {
  const rate = stored.ratePerSqft || maintenanceConfig.maintenanceRatePerSqft;
  const maintenanceAmount = Math.round(rate * areaSqft);
  const saved = stored.assignments.find((a) => a.flatId === flatId);
  if (saved) {
    return saved;
  }
  return {
    flatId,
    maintenanceAmount,
    otherAmount: 0,
    maintenanceStatus: deriveStatus(flatId, maintenanceAmount),
  };
}

export function getBillingSetupConfig(): BillingSetupConfig {
  const flats = getFlats();
  const assignments = flats.map((flat) =>
    buildDefaultAssignment(flat.id, flat.areaSqft)
  );
  return {
    otherColumnLabel: stored.otherColumnLabel || "Other",
    billingPeriod: stored.billingPeriod || "July 2025",
    ratePerSqft: stored.ratePerSqft || maintenanceConfig.maintenanceRatePerSqft,
    assignments,
  };
}

export function getFlatBillingRows(): FlatBillingRow[] {
  const config = getBillingSetupConfig();
  return getFlats()
    .sort((a, b) =>
      a.flatNumber.localeCompare(b.flatNumber, undefined, { numeric: true })
    )
    .map((flat) => {
      const assignment =
        config.assignments.find((a) => a.flatId === flat.id) ??
        buildDefaultAssignment(flat.id, flat.areaSqft);
      const block = getBlockById(flat.blockId);
      const owner = getPrimaryOwner(flat.id);
      return {
        ...assignment,
        flatNumber: flat.flatNumber,
        blockName: block?.name ?? flat.blockId,
        residentName: owner?.fullName ?? null,
        areaSqft: flat.areaSqft,
        totalDue:
          assignment.maintenanceStatus === "paid"
            ? assignment.otherAmount
            : assignment.maintenanceAmount + assignment.otherAmount,
      };
    });
}

export function getBillingSetupSummary() {
  const rows = getFlatBillingRows();
  const pending = rows.filter((r) => r.maintenanceStatus !== "paid").length;
  const totalMaintenance = rows.reduce((s, r) => s + r.maintenanceAmount, 0);
  const totalOther = rows.reduce((s, r) => s + r.otherAmount, 0);
  return {
    flatCount: rows.length,
    pendingCount: pending,
    paidCount: rows.length - pending,
    totalMaintenance: formatCurrency(totalMaintenance),
    totalOther: formatCurrency(totalOther),
    billingPeriod: getBillingSetupConfig().billingPeriod,
  };
}

export { formatCurrency, getDemoTodayIso };
