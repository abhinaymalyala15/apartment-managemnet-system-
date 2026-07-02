/**
 * Asset & Facility Operations data layer (Phase 7G).
 */
import communityAssetsData from "@/data/community-assets.json";
import assetVendorsData from "@/data/asset-vendors.json";
import assetAmcData from "@/data/asset-amc.json";
import assetDocumentsData from "@/data/asset-documents.json";
import assetNotesData from "@/data/asset-internal-notes.json";
import assetServicesData from "@/data/asset-services.json";

import type {
  AssetAmcRecord,
  AssetCategory,
  AssetDocument,
  AssetInternalNote,
  AssetServiceRecord,
  AssetTimelineEvent,
  CommunityAsset,
  FacilityAssetProfile,
  FacilityDashboardSummary,
  FacilityScope,
  FacilityVendor,
} from "@/types";

import { ASSET_CATEGORIES } from "@/config/facility-workspace";
import {
  DEMO_REFERENCE_DATE,
  formatDate,
  getBlockById,
  getDemoTodayIso,
  getFlatById,
  getServices,
  isServiceToday,
} from "@/lib/data";

const assets = communityAssetsData as CommunityAsset[];
const vendors = assetVendorsData as FacilityVendor[];
const amcRecords = assetAmcData as AssetAmcRecord[];
const documents = assetDocumentsData as AssetDocument[];
const notes = assetNotesData as AssetInternalNote[];
const assetServices = assetServicesData as AssetServiceRecord[];

const DEMO_TODAY = DEMO_REFERENCE_DATE;

function daysUntil(dateIso: string): number {
  const target = new Date(dateIso);
  const today = new Date(DEMO_TODAY);
  return Math.ceil((target.getTime() - today.getTime()) / 86400000);
}

export function getAssetCategoryLabel(type: AssetCategory): string {
  return ASSET_CATEGORIES.find((c) => c.id === type)?.label ?? type;
}

export function getFacilityScopeLabel(scope: FacilityScope): string {
  const labels: Record<FacilityScope, string> = {
    community: "Whole apartment",
    block: "Block",
    flat: "Flat",
  };
  return labels[scope];
}

export function getAssetStatusLabel(status: CommunityAsset["status"]): string {
  const labels: Record<CommunityAsset["status"], string> = {
    active: "Active",
    amc_overdue: "AMC overdue",
    service_due_soon: "Service due soon",
    under_maintenance: "Under maintenance",
    inactive: "Inactive",
  };
  return labels[status];
}

export function getCommunityAssets(): CommunityAsset[] {
  return assets;
}

export function getAssetById(assetId: string): CommunityAsset | undefined {
  return assets.find((a) => a.id === assetId);
}

export function getFacilityVendors(): FacilityVendor[] {
  return vendors;
}

export function getVendorById(vendorId: string): FacilityVendor | undefined {
  return vendors.find((v) => v.id === vendorId);
}

export function getAmcRecords(): AssetAmcRecord[] {
  return amcRecords;
}

export function getAmcForAsset(assetId: string): AssetAmcRecord | null {
  return amcRecords.find((a) => a.assetId === assetId) ?? null;
}

export function getAssetServices(assetId?: string): AssetServiceRecord[] {
  if (assetId) {
    return assetServices.filter((s) => s.assetId === assetId);
  }
  return assetServices;
}

export type ServicePeriodFilter = "all" | "week" | "month";

export type ServiceTiming = "happening" | "upcoming" | "past";

export function getServiceTiming(service: AssetServiceRecord): ServiceTiming {
  const todayIso = getDemoTodayIso();

  if (service.status === "in_progress") return "happening";
  if (service.status === "scheduled" && service.scheduledDate === todayIso) {
    return "happening";
  }
  if (
    service.status === "completed" ||
    service.status === "cancelled" ||
    service.scheduledDate < todayIso
  ) {
    return "past";
  }
  return "upcoming";
}

export function filterAssetServicesByPeriod(
  services: AssetServiceRecord[],
  period: ServicePeriodFilter
): AssetServiceRecord[] {
  if (period === "all") return services;

  const today = new Date(getDemoTodayIso());
  const todayIso = getDemoTodayIso();
  const monthPrefix = todayIso.slice(0, 7);

  if (period === "month") {
    return services.filter(
      (s) =>
        s.scheduledDate.startsWith(monthPrefix) ||
        (s.completedDate?.startsWith(monthPrefix) ?? false)
    );
  }

  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - weekStart.getDay());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  const weekStartIso = weekStart.toISOString().slice(0, 10);
  const weekEndIso = weekEnd.toISOString().slice(0, 10);

  return services.filter((s) => {
    const date = s.completedDate ?? s.scheduledDate;
    return date >= weekStartIso && date <= weekEndIso;
  });
}

export function getAssetDocuments(assetId: string): AssetDocument[] {
  return documents.filter((d) => d.assetId === assetId);
}

export function getAssetNotes(assetId: string): AssetInternalNote[] {
  return notes.filter((n) => n.assetId === assetId);
}

function buildAssetTimeline(asset: CommunityAsset): AssetTimelineEvent[] {
  const events: AssetTimelineEvent[] = [];

  if (asset.installationDate) {
    events.push({
      id: `tl-${asset.id}-install`,
      assetId: asset.id,
      date: asset.installationDate,
      title: "Asset installed",
      description: `${getAssetCategoryLabel(asset.assetType)} commissioned at ${asset.location ?? "site"}`,
      type: "installed",
    });
  }

  const amc = getAmcForAsset(asset.id);
  if (amc) {
    events.push({
      id: `tl-${asset.id}-amc`,
      assetId: asset.id,
      date: amc.startDate,
      title: "AMC renewed",
      description: `${amc.vendorName} · valid until ${formatDate(amc.endDate)}`,
      type: "amc_renewed",
    });
  }

  for (const svc of getAssetServices(asset.id)) {
    if (svc.status === "completed" && svc.completedDate) {
      events.push({
        id: `tl-svc-done-${svc.id}`,
        assetId: asset.id,
        date: svc.completedDate,
        title: "Service completed",
        description: `${svc.title} · ${svc.vendor}`,
        type: "service_completed",
      });
    } else if (svc.status === "scheduled") {
      events.push({
        id: `tl-svc-sched-${svc.id}`,
        assetId: asset.id,
        date: svc.scheduledDate,
        title: "Service scheduled",
        description: `${svc.title} · ${svc.scheduledTime}`,
        type: "service_scheduled",
      });
    }
  }

  for (const doc of getAssetDocuments(asset.id)) {
    events.push({
      id: `tl-doc-${doc.id}`,
      assetId: asset.id,
      date: doc.uploadedAt,
      title: "Document uploaded",
      description: doc.title,
      type: "document",
    });
  }

  if (asset.status === "amc_overdue") {
    events.push({
      id: `tl-${asset.id}-amc-overdue`,
      assetId: asset.id,
      date: asset.amcExpiryDate,
      title: "AMC expired",
      description: `Renew with ${asset.vendor}`,
      type: "breakdown",
    });
  }

  return events.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getFacilityAssetProfile(
  assetId: string
): FacilityAssetProfile | null {
  const asset = getAssetById(assetId);
  if (!asset) return null;

  const block = asset.blockId ? getBlockById(asset.blockId) : undefined;
  const flat = asset.flatId ? getFlatById(asset.flatId) : undefined;

  return {
    ...asset,
    blockName: block?.name,
    flatNumber: flat?.flatNumber,
    amc: getAmcForAsset(assetId),
    documents: getAssetDocuments(assetId),
    internalNotes: getAssetNotes(assetId),
    timeline: buildAssetTimeline(asset),
    services: getAssetServices(assetId),
  };
}

export function getFacilityDashboardSummary(): FacilityDashboardSummary {
  const todayIso = getDemoTodayIso();
  const allServices = assetServices;

  const todayServices = allServices.filter(
    (s) => s.status === "scheduled" && s.scheduledDate === todayIso
  );

  const upcomingServices = allServices
    .filter((s) => s.status === "scheduled" && s.scheduledDate >= todayIso)
    .sort(
      (a, b) =>
        new Date(a.scheduledDate).getTime() -
        new Date(b.scheduledDate).getTime()
    )
    .slice(0, 8);

  const recentlyCompleted = allServices
    .filter((s) => s.status === "completed")
    .sort(
      (a, b) =>
        new Date(b.completedDate ?? b.scheduledDate).getTime() -
        new Date(a.completedDate ?? a.scheduledDate).getTime()
    )
    .slice(0, 5);

  const amcExpiringSoon = amcRecords.filter((a) => {
    const days = daysUntil(a.endDate);
    return days >= 0 && days <= 30;
  }).length;

  const amcOverdue = assets.filter((a) => a.status === "amc_overdue").length;

  const needsServicing = assets.filter(
    (a) =>
      a.status === "service_due_soon" ||
      a.status === "amc_overdue" ||
      (a.nextServiceDate && daysUntil(a.nextServiceDate) <= 7)
  ).length;

  const overdueServices = allServices.filter(
    (s) =>
      s.status === "scheduled" && s.scheduledDate < todayIso
  ).length;

  const underMaintenance = assets.filter(
    (a) => a.status === "under_maintenance"
  ).length;

  const criticalAssets = assets.filter(
    (a) => a.status === "amc_overdue" || a.status === "service_due_soon"
  );

  return {
    totalAssets: assets.length,
    needsServicing,
    amcExpiringSoon,
    amcOverdue,
    scheduledToday: todayServices.length,
    overdueServices,
    underMaintenance,
    recentlyCompleted,
    todayServices,
    upcomingServices,
    criticalAssets,
  };
}

export function getAssetsByBlock(blockId: string): CommunityAsset[] {
  return assets.filter(
    (a) => a.blockId === blockId || a.scope === "community"
  );
}

/** Legacy bridge — society services from services.json merged for flat scope */
export function getLegacySocietyServices() {
  return getServices().filter((s) => !s.flatId);
}

export { formatDate, daysUntil };
