/**
 * Progressive disclosure for the Operations Dashboard.
 * Same dashboard adapts from 55 flats to 5,000+ without separate layouts.
 */
export type AdminScaleTier = "small" | "medium" | "large";

export function getAdminScaleTier(totalFlats: number): AdminScaleTier {
  if (totalFlats <= 100) return "small";
  if (totalFlats <= 500) return "medium";
  return "large";
}

export const ADMIN_SCALE_LIMITS = {
  small: {
    criticalAlerts: 3,
    followUps: 5,
    activityEvents: 6,
    todayPayments: 5,
  },
  medium: {
    criticalAlerts: 5,
    followUps: 8,
    activityEvents: 8,
    todayPayments: 8,
  },
  large: {
    criticalAlerts: 6,
    followUps: 10,
    activityEvents: 10,
    todayPayments: 10,
  },
} as const;

export function getScaleLimits(tier: AdminScaleTier) {
  return ADMIN_SCALE_LIMITS[tier];
}

export function shouldShowBlockSummary(
  tier: AdminScaleTier,
  blockCount: number,
  totalFlats: number
): boolean {
  if (blockCount > 1) return true;
  if (tier === "large") return true;
  if (tier === "medium" && totalFlats >= 100) return true;
  return false;
}

export function shouldShowTowerHealth(tier: AdminScaleTier): boolean {
  return tier === "large";
}
