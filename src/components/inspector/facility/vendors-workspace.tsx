"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ListToolbar } from "@/components/ui/list-toolbar";
import {
  getFacilityVendors,
  getAssetById,
  getAssetServices,
} from "@/lib/asset-data";
import { routes } from "@/config/routes";

export function VendorsWorkspace() {
  const [search, setSearch] = useState("");
  const all = getFacilityVendors();

  const filtered = useMemo(() => {
    if (!search.trim()) return all;
    const q = search.toLowerCase();
    return all.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        v.category.toLowerCase().includes(q)
    );
  }, [all, search]);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Vendor profiles — linked assets and service history. Future-ready for
        ratings and invoices.
      </p>
      <ListToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search vendor…"
        resultCount={{ shown: filtered.length, total: all.length }}
      />
      <ul className="grid gap-3 lg:grid-cols-2">
        {filtered.map((vendor) => {
          const services = getAssetServices().filter(
            (s) => s.vendorId === vendor.id
          );
          return (
            <li key={vendor.id} className="surface-card p-4 sm:p-5">
              <p className="font-semibold">{vendor.name}</p>
              <p className="text-sm text-muted-foreground">{vendor.category}</p>
              <dl className="mt-3 space-y-1 text-sm">
                <div>
                  <span className="text-muted-foreground">Phone: </span>
                  {vendor.phone}
                </div>
                <div>
                  <span className="text-muted-foreground">Email: </span>
                  {vendor.email}
                </div>
                {vendor.contactPerson && (
                  <div>
                    <span className="text-muted-foreground">Contact: </span>
                    {vendor.contactPerson}
                  </div>
                )}
              </dl>
              <p className="mt-3 text-xs font-medium text-muted-foreground">
                AMC assets ({vendor.assetIds.length})
              </p>
              <ul className="mt-1 space-y-1">
                {vendor.assetIds.map((id) => {
                  const asset = getAssetById(id);
                  return (
                    <li key={id}>
                      <Link
                        href={routes.dashboard.inspector.services.asset(id)}
                        className="text-sm text-primary hover:underline"
                      >
                        {asset?.name ?? id}
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-3 text-xs text-muted-foreground">
                {services.length} service record{services.length !== 1 ? "s" : ""}{" "}
                on file
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
