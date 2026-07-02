"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ListToolbar } from "@/components/ui/list-toolbar";
import { AssetCard } from "@/components/inspector/facility/asset-card";
import {
  getCommunityAssets,
} from "@/lib/asset-data";
import { getBlockById } from "@/lib/data";
import { routes } from "@/config/routes";
import { ASSET_CATEGORIES } from "@/config/facility-workspace";

export function AssetCatalogWorkspace() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const allAssets = getCommunityAssets();

  const filtered = useMemo(() => {
    let list = allAssets;
    if (category !== "all") {
      list = list.filter((a) => a.assetType === category);
    }
    if (status !== "all") {
      list = list.filter((a) => a.status === status);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.vendor.toLowerCase().includes(q) ||
          a.location?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [allAssets, search, category, status]);

  const categoryOptions = [
    { value: "all", label: "All categories" },
    ...ASSET_CATEGORIES.filter((c) => c.enabled).map((c) => ({
      value: c.id,
      label: c.label,
    })),
  ];

  return (
    <div className="space-y-4">
      <ListToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search assets, vendor, location…"
        filters={[
          {
            id: "category",
            value: category,
            onChange: setCategory,
            placeholder: "Category",
            options: categoryOptions,
          },
          {
            id: "status",
            value: status,
            onChange: setStatus,
            placeholder: "Status",
            options: [
              { value: "all", label: "All statuses" },
              { value: "active", label: "Active" },
              { value: "service_due_soon", label: "Service due soon" },
              { value: "amc_overdue", label: "AMC overdue" },
              { value: "under_maintenance", label: "Under maintenance" },
            ],
          },
        ]}
        resultCount={{ shown: filtered.length, total: allAssets.length }}
      />
      <div className="grid gap-3 lg:grid-cols-2">
        {filtered.map((asset) => (
          <Link
            key={asset.id}
            href={routes.dashboard.inspector.services.asset(asset.id)}
          >
            <AssetCard
              asset={asset}
              blockName={
                asset.blockId ? getBlockById(asset.blockId)?.name : undefined
              }
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
