/**
 * Admin services setup — assets, vendors, AMC, frequency with publish state.
 */
import {
  getAmcRecords,
  getAssetCategoryLabel,
  getAssetStatusLabel,
  getCommunityAssets,
  getFacilityVendors,
} from "@/lib/asset-data";
import type {
  AdminServiceAmc,
  AdminServiceAsset,
  AdminServiceFrequency,
  AdminServiceVendor,
  AssetCategory,
  CommunityAssetStatus,
  ServicePublishStatus,
} from "@/types";

function defaultIntervalDays(asset: { lastServiceDate?: string; nextServiceDate?: string }): number {
  if (asset.lastServiceDate && asset.nextServiceDate) {
    const days = Math.round(
      (new Date(asset.nextServiceDate).getTime() -
        new Date(asset.lastServiceDate).getTime()) /
        86400000
    );
    if (days > 0) return days;
  }
  return 90;
}

export function toAdminServiceAsset(
  asset: ReturnType<typeof getCommunityAssets>[number],
  publishStatus: ServicePublishStatus = "published"
): AdminServiceAsset {
  return {
    ...asset,
    publishStatus,
    serviceIntervalDays: defaultIntervalDays(asset),
  };
}

export function getAdminServiceAssets(): AdminServiceAsset[] {
  return getCommunityAssets().map((a) => toAdminServiceAsset(a, "published"));
}

export function getAdminServiceVendors(): AdminServiceVendor[] {
  return getFacilityVendors().map((v) => ({ ...v, publishStatus: "published" as const }));
}

export function getAdminServiceAmcRecords(): AdminServiceAmc[] {
  return getAmcRecords().map((r) => ({ ...r, publishStatus: "published" as const }));
}

export function getAdminServiceFrequencies(assets: AdminServiceAsset[]): AdminServiceFrequency[] {
  return assets.map((a) => ({
    assetId: a.id,
    assetName: a.name,
    assetType: a.assetType,
    serviceIntervalDays: a.serviceIntervalDays,
    nextServiceDate: a.nextServiceDate,
    publishStatus: a.publishStatus,
  }));
}

export function getAdminServicesSummary(assets: AdminServiceAsset[]) {
  return {
    total: assets.length,
    published: assets.filter((a) => a.publishStatus === "published").length,
    drafts: assets.filter((a) => a.publishStatus === "draft").length,
    dueSoon: assets.filter((a) => a.status === "service_due_soon").length,
  };
}

export { getAssetCategoryLabel, getAssetStatusLabel };
export type { AssetCategory, CommunityAssetStatus, ServicePublishStatus };
