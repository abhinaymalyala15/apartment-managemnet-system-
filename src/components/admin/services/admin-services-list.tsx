"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getAssetCategoryLabel,
  getAssetStatusLabel,
  getAssetById,
  getCommunityAssets,
  getFacilityVendors,
  getAmcRecords,
} from "@/lib/asset-data";
import { formatDate } from "@/lib/data";

interface AdminServicesListProps {
  type: "assets" | "vendors" | "amc" | "frequency";
}

export function AdminServicesList({ type }: AdminServicesListProps) {
  if (type === "assets") {
    const assets = getCommunityAssets();
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Register society assets. Inspectors mark service completion in the Services module.
          </p>
          <Button size="sm">Add asset</Button>
        </div>
        <div className="surface-card divide-y">
          {assets.map((asset) => (
            <div key={asset.id} className="px-4 py-4 sm:px-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{asset.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {getAssetCategoryLabel(asset.assetType)} · {asset.location ?? "—"}
                  </p>
                </div>
                <Badge variant="outline">{getAssetStatusLabel(asset.status)}</Badge>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Vendor: {asset.vendor}
                {asset.nextServiceDate ? ` · Next service ${formatDate(asset.nextServiceDate)}` : ""}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === "vendors") {
    const vendors = getFacilityVendors();
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Approved vendors for AMC and scheduled maintenance.
          </p>
          <Button size="sm">Add vendor</Button>
        </div>
        <div className="surface-card divide-y">
          {vendors.map((vendor) => (
            <div key={vendor.id} className="px-4 py-4 sm:px-5">
              <p className="font-medium">{vendor.name}</p>
              <p className="text-sm text-muted-foreground">{vendor.category}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {vendor.contactPerson} · {vendor.phone}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === "amc") {
    const records = getAmcRecords();
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            AMC contracts and renewal tracking.
          </p>
          <Button size="sm">Add AMC contract</Button>
        </div>
        <div className="surface-card divide-y">
          {records.map((record) => {
            const asset = getAssetById(record.assetId);
            return (
              <div key={record.id} className="px-4 py-4 sm:px-5">
                <p className="font-medium">{asset?.name ?? record.assetId}</p>
                <p className="text-sm text-muted-foreground">{record.vendorName}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Until {formatDate(record.endDate)} · {record.contactPerson} · {record.phone}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const assets = getCommunityAssets();
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          Default service schedules and reminder rules for asset maintenance.
        </p>
        <Button size="sm">Edit frequency rules</Button>
      </div>
      <div className="surface-card divide-y">
        {assets.map((asset) => (
          <div key={asset.id} className="flex items-center justify-between px-4 py-4 sm:px-5">
            <div>
              <p className="font-medium">{asset.name}</p>
              <p className="text-sm text-muted-foreground">{getAssetCategoryLabel(asset.assetType)}</p>
            </div>
            <span className="text-sm font-medium">
              {asset.nextServiceDate
                ? `Next ${formatDate(asset.nextServiceDate)}`
                : "Not scheduled"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
