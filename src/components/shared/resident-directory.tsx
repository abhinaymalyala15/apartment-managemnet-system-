"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ListToolbar, type FilterOption } from "@/components/ui/list-toolbar";
import {
  filterResidentTableRows,
  formatCurrency,
  type MaintenanceStatusFilter,
  type ResidentTableRow,
} from "@/lib/data";
import type { OccupancyStatus } from "@/types";
import {
  getOccupancyLabel,
  getOccupancyVariant,
  getResidentDirectoryLabel,
} from "@/lib/occupancy-ui";
import { Search } from "lucide-react";

interface ResidentDirectoryProps {
  rows: ResidentTableRow[];
  getFlatHref: (flatId: string) => string;
  compact?: boolean;
  showOccupancyFilter?: boolean;
  showMaintenanceFilter?: boolean;
  showMaintenanceOnRow?: boolean;
  useShortOccupancyLabel?: boolean;
  occupancyFilterOptions?: FilterOption[];
  searchPlaceholder?: string;
}

const maintenanceLabels: Record<
  ResidentTableRow["maintenanceStatus"],
  string
> = {
  paid: "Paid",
  pending: "Pending",
  overdue: "Overdue",
  vacant: "Vacant",
};

const maintenanceVariants: Record<
  ResidentTableRow["maintenanceStatus"],
  "default" | "secondary" | "destructive" | "outline"
> = {
  paid: "default",
  pending: "secondary",
  overdue: "destructive",
  vacant: "outline",
};

const defaultOccupancyFilterOptions: FilterOption[] = [
  { value: "all", label: "All occupancy" },
  { value: "owner_occupied", label: "Owner" },
  { value: "tenant_occupied", label: "Tenant" },
  { value: "vacant", label: "Vacant" },
];

export function ResidentDirectory({
  rows,
  getFlatHref,
  compact = false,
  showOccupancyFilter = true,
  showMaintenanceFilter = true,
  showMaintenanceOnRow = true,
  useShortOccupancyLabel = false,
  occupancyFilterOptions = defaultOccupancyFilterOptions,
  searchPlaceholder = "Flat, owner, tenant, family, or mobile…",
}: ResidentDirectoryProps) {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";

  const [search, setSearch] = useState(initialQuery);
  const [maintenanceFilter, setMaintenanceFilter] =
    useState<MaintenanceStatusFilter>("all");
  const [occupancyFilter, setOccupancyFilter] = useState<
    OccupancyStatus | "all"
  >("all");

  useEffect(() => {
    if (initialQuery) setSearch(initialQuery);
  }, [initialQuery]);

  const filtered = useMemo(
    () =>
      filterResidentTableRows(
        rows,
        search,
        showMaintenanceFilter ? maintenanceFilter : "all",
        occupancyFilter
      ),
    [
      rows,
      search,
      maintenanceFilter,
      occupancyFilter,
      showMaintenanceFilter,
    ]
  );

  const preview = compact ? filtered.slice(0, 5) : filtered;

  const toolbarFilters = [
    ...(showMaintenanceFilter
      ? [
          {
            id: "maintenance",
            value: maintenanceFilter,
            onChange: (v: string) =>
              setMaintenanceFilter(v as MaintenanceStatusFilter),
            placeholder: "Maintenance",
            options: [
              { value: "all", label: "All maintenance" },
              { value: "overdue", label: "Overdue" },
              { value: "pending", label: "Pending" },
              { value: "paid", label: "Paid" },
              { value: "vacant", label: "Vacant" },
            ],
          },
        ]
      : []),
    ...(showOccupancyFilter
      ? [
          {
            id: "occupancy",
            value: occupancyFilter,
            onChange: (v: string) =>
              setOccupancyFilter(v as OccupancyStatus | "all"),
            placeholder: "Section",
            options: occupancyFilterOptions,
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-4">
      <ListToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={searchPlaceholder}
        filters={toolbarFilters}
        resultCount={
          !compact ? { shown: filtered.length, total: rows.length } : undefined
        }
      />

      {preview.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No matches found"
          description="Try a different name or phone number."
        />
      ) : (
        <ul className="surface-card divide-y">
          {preview.map((row) => (
            <li key={row.id}>
              <Link
                href={getFlatHref(row.id)}
                className="flex items-center justify-between gap-4 px-4 py-4 transition-colors hover:bg-muted/40"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <p className="font-semibold">Flat {row.flatNumber}</p>
                    <p className="text-sm text-muted-foreground">
                      Floor {row.floor}
                    </p>
                  </div>
                  <p className="mt-1 font-medium">{row.residentName}</p>
                  <p className="mt-0.5 truncate text-sm text-muted-foreground">
                    {row.ownerName && row.tenantName
                      ? `Owner: ${row.ownerName} · Tenant: ${row.tenantName}`
                      : row.ownerName || row.tenantName || "No occupant"}
                    {row.phone && (
                      <>
                        {" · "}
                        <span className="text-primary">{row.phone}</span>
                      </>
                    )}
                  </p>
                  {row.familyNames.length > 0 && (
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      Family: {row.familyNames.slice(0, 3).join(", ")}
                      {row.familyNames.length > 3 &&
                        ` +${row.familyNames.length - 3}`}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 flex-col items-end justify-center gap-1">
                  <Badge variant={getOccupancyVariant(row.occupancyStatus)}>
                    {useShortOccupancyLabel
                      ? getResidentDirectoryLabel(row.occupancyStatus)
                      : getOccupancyLabel(row.occupancyStatus)}
                  </Badge>
                  {showMaintenanceOnRow && (
                    <>
                      <Badge
                        variant={maintenanceVariants[row.maintenanceStatus]}
                        className="text-[10px]"
                      >
                        {maintenanceLabels[row.maintenanceStatus]}
                      </Badge>
                      {row.pendingAmount > 0 && (
                        <p className="text-xs font-medium tabular-nums text-destructive">
                          {formatCurrency(row.pendingAmount)}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {compact && filtered.length > 5 && (
        <p className="text-center text-sm text-muted-foreground">
          {filtered.length - 5} more matches — open full directory for results
        </p>
      )}
    </div>
  );
}
