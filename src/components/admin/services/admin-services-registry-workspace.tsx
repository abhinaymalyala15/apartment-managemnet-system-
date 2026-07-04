"use client";

import { useMemo, useState } from "react";
import { Plus, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ListToolbar } from "@/components/ui/list-toolbar";
import { PublishBadge } from "@/components/admin/services/publish-badge";
import { ServiceRowActions } from "@/components/admin/services/service-row-actions";
import {
  ServiceAssetFormSheet,
  type ServiceAssetFormValues,
} from "@/components/admin/services/service-asset-form-sheet";
import { useServicesSetup } from "@/components/admin/services/services-setup-provider";
import {
  getAssetCategoryLabel,
  getAssetStatusLabel,
} from "@/lib/admin-services-setup-data";
import { formatDate } from "@/lib/data";
import type { AdminServiceAsset } from "@/types";

export function AdminServicesRegistryWorkspace() {
  const {
    assets,
    assetSummary,
    addAsset,
    updateAsset,
    removeAsset,
    toggleAssetPublish,
  } = useServicesSetup();

  const [search, setSearch] = useState("");
  const [publishFilter, setPublishFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<AdminServiceAsset | null>(null);
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return assets.filter((a) => {
      if (publishFilter !== "all" && a.publishStatus !== publishFilter) return false;
      if (statusFilter !== "all" && a.status !== statusFilter) return false;
      if (!q) return true;
      return (
        a.name.toLowerCase().includes(q) ||
        a.vendor.toLowerCase().includes(q) ||
        getAssetCategoryLabel(a.assetType).toLowerCase().includes(q) ||
        (a.location?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [assets, search, publishFilter, statusFilter]);

  function handleSave(values: ServiceAssetFormValues) {
    const patch = {
      name: values.name,
      assetType: values.assetType,
      location: values.location,
      vendor: values.vendor,
      nextServiceDate: values.nextServiceDate || undefined,
      amcExpiryDate: values.amcExpiryDate,
      serviceIntervalDays: values.serviceIntervalDays,
      status: values.status,
      publishStatus: values.publishStatus,
    };
    if (editing) updateAsset(editing.id, patch);
    else
      addAsset({
        ...patch,
        scope: "community",
        amcExpiryDate: values.amcExpiryDate || "2025-12-31",
      });
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        One registry for every society asset — vendor, service schedule, and AMC expiry
        live on each row. Publish when ready for inspectors; no separate vendor or AMC
        screens needed.
      </p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Total assets", assetSummary.total],
          ["Published", assetSummary.published],
          ["Drafts", assetSummary.drafts],
          ["Due soon", assetSummary.dueSoon],
        ].map(([label, value]) => (
          <div key={label} className="surface-card p-4">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-1 text-xl font-semibold tabular-nums">{value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          onClick={() => {
            setEditing(null);
            setSheetOpen(true);
          }}
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Add asset
        </Button>
        {assetSummary.drafts > 0 && (
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              assets
                .filter((a) => a.publishStatus === "draft")
                .forEach((a) => toggleAssetPublish(a.id))
            }
          >
            <Upload className="mr-1.5 h-4 w-4" />
            Publish all drafts ({assetSummary.drafts})
          </Button>
        )}
      </div>

      <ListToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search asset, vendor, category…"
        filters={[
          {
            id: "visibility",
            value: publishFilter,
            onChange: setPublishFilter,
            placeholder: "Visibility",
            options: [
              { value: "all", label: "All visibility" },
              { value: "published", label: "Published" },
              { value: "draft", label: "Draft" },
            ],
          },
          {
            id: "status",
            value: statusFilter,
            onChange: setStatusFilter,
            placeholder: "Status",
            options: [
              { value: "all", label: "All statuses" },
              { value: "active", label: "Active" },
              { value: "service_due_soon", label: "Due soon" },
              { value: "amc_overdue", label: "AMC overdue" },
              { value: "under_maintenance", label: "Under maintenance" },
              { value: "inactive", label: "Inactive" },
            ],
          },
        ]}
        resultCount={{ shown: filtered.length, total: assets.length }}
      />

      <div className="surface-card overflow-hidden">
        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full min-w-[960px] text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
                <th className="px-4 py-3 font-medium">Asset</th>
                <th className="px-4 py-3 font-medium">Location</th>
                <th className="px-4 py-3 font-medium">Vendor</th>
                <th className="px-4 py-3 font-medium">Interval</th>
                <th className="px-4 py-3 font-medium">Next service</th>
                <th className="px-4 py-3 font-medium">AMC expiry</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Visibility</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((asset) => (
                <tr key={asset.id} className="hover:bg-muted/20">
                  <td className="px-4 py-3">
                    <p className="font-medium">{asset.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {getAssetCategoryLabel(asset.assetType)}
                    </p>
                  </td>
                  <td className="max-w-[140px] px-4 py-3 text-muted-foreground">
                    {asset.location ?? "—"}
                  </td>
                  <td className="px-4 py-3">{asset.vendor}</td>
                  <td className="px-4 py-3 tabular-nums">{asset.serviceIntervalDays}d</td>
                  <td className="px-4 py-3 tabular-nums text-muted-foreground">
                    {asset.nextServiceDate ? formatDate(asset.nextServiceDate) : "—"}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-muted-foreground">
                    {formatDate(asset.amcExpiryDate)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="text-[10px]">
                      {getAssetStatusLabel(asset.status)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <PublishBadge status={asset.publishStatus} />
                  </td>
                  <td className="px-4 py-3">
                    <ServiceRowActions
                      isPublished={asset.publishStatus === "published"}
                      confirmRemove={confirmRemoveId === asset.id}
                      onEdit={() => {
                        setEditing(asset);
                        setSheetOpen(true);
                      }}
                      onTogglePublish={() => toggleAssetPublish(asset.id)}
                      onRemove={() => setConfirmRemoveId(asset.id)}
                      onConfirmRemove={() => {
                        removeAsset(asset.id);
                        setConfirmRemoveId(null);
                      }}
                      onCancelRemove={() => setConfirmRemoveId(null)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ul className="divide-y lg:hidden">
          {filtered.map((asset) => (
            <li key={asset.id} className="space-y-3 px-4 py-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{asset.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {getAssetCategoryLabel(asset.assetType)} · {asset.location ?? "—"}
                  </p>
                </div>
                <PublishBadge status={asset.publishStatus} />
              </div>
              <dl className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <dt className="text-muted-foreground">Vendor</dt>
                  <dd className="font-medium">{asset.vendor}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Interval</dt>
                  <dd className="font-medium tabular-nums">{asset.serviceIntervalDays} days</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Next service</dt>
                  <dd className="font-medium tabular-nums">
                    {asset.nextServiceDate ? formatDate(asset.nextServiceDate) : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">AMC expiry</dt>
                  <dd className="font-medium tabular-nums">{formatDate(asset.amcExpiryDate)}</dd>
                </div>
              </dl>
              <Badge variant="outline" className="text-[10px]">
                {getAssetStatusLabel(asset.status)}
              </Badge>
              <ServiceRowActions
                isPublished={asset.publishStatus === "published"}
                confirmRemove={confirmRemoveId === asset.id}
                onEdit={() => {
                  setEditing(asset);
                  setSheetOpen(true);
                }}
                onTogglePublish={() => toggleAssetPublish(asset.id)}
                onRemove={() => setConfirmRemoveId(asset.id)}
                onConfirmRemove={() => {
                  removeAsset(asset.id);
                  setConfirmRemoveId(null);
                }}
                onCancelRemove={() => setConfirmRemoveId(null)}
              />
            </li>
          ))}
        </ul>

        {filtered.length === 0 && (
          <p className="px-4 py-10 text-center text-sm text-muted-foreground">
            No assets match your filters.
          </p>
        )}
      </div>

      <ServiceAssetFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        asset={editing}
        onSave={handleSave}
      />
    </div>
  );
}
