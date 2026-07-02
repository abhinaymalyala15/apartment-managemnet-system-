"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ListToolbar } from "@/components/ui/list-toolbar";
import { useFacilityActions } from "@/components/inspector/facility/facility-provider";
import {
  daysUntil,
  formatDate,
  getAmcRecords,
  getAssetById,
} from "@/lib/asset-data";
import { routes } from "@/config/routes";

export function AmcWorkspace() {
  const { openAction } = useFacilityActions();
  const [search, setSearch] = useState("");
  const all = getAmcRecords();

  const filtered = useMemo(() => {
    if (!search.trim()) return all;
    const q = search.toLowerCase();
    return all.filter(
      (a) =>
        a.vendorName.toLowerCase().includes(q) ||
        getAssetById(a.assetId)?.name.toLowerCase().includes(q)
    );
  }, [all, search]);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Annual Maintenance Contracts — renewal reminders, vendor contacts, and
        asset linkage.
      </p>
      <ListToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search AMC or vendor…"
        resultCount={{ shown: filtered.length, total: all.length }}
      />
      <ul className="surface-card divide-y">
        {filtered.map((amc) => {
          const asset = getAssetById(amc.assetId);
          const days = daysUntil(amc.endDate);
          const urgent = days < 0 || days <= amc.renewalReminderDays;

          return (
            <li
              key={amc.id}
              className="flex flex-wrap items-start justify-between gap-3 px-4 py-4"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">{asset?.name ?? amc.assetId}</p>
                  {urgent && (
                    <Badge variant={days < 0 ? "destructive" : "secondary"}>
                      {days < 0 ? "Expired" : `Expires in ${days}d`}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{amc.vendorName}</p>
                <dl className="mt-2 grid gap-1 text-xs sm:grid-cols-2">
                  <div>
                    <span className="text-muted-foreground">Period: </span>
                    {formatDate(amc.startDate)} — {formatDate(amc.endDate)}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Contact: </span>
                    {amc.contactPerson} · {amc.phone}
                  </div>
                </dl>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    openAction("renew-amc", {
                      assetId: amc.assetId,
                      assetName: asset?.name,
                    })
                  }
                >
                  Renew
                </Button>
                <Link
                  href={routes.dashboard.inspector.services.asset(amc.assetId)}
                  className="inline-flex h-8 items-center rounded-lg border px-3 text-xs font-medium hover:bg-muted"
                >
                  View asset
                </Link>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
