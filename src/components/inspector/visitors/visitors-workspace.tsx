"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ListToolbar } from "@/components/ui/list-toolbar";
import { Badge } from "@/components/ui/badge";
import {
  getEnrichedVisitorsForPeriod,
  type VisitorPeriodFilter,
} from "@/lib/admin-data";
import { formatDate } from "@/lib/data";
import { routes } from "@/config/routes";
import type { EnrichedVisitor } from "@/lib/admin-data";

const PERIOD_OPTIONS = [
  { value: "all", label: "All" },
  { value: "week", label: "This week" },
  { value: "month", label: "This month" },
] as const;

const statusLabel: Record<EnrichedVisitor["status"], string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

export function VisitorsWorkspace() {
  const [periodFilter, setPeriodFilter] = useState<VisitorPeriodFilter>("all");
  const [search, setSearch] = useState("");

  const periodBase = useMemo(
    () => getEnrichedVisitorsForPeriod(periodFilter),
    [periodFilter]
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return periodBase;
    const q = search.toLowerCase();
    return periodBase.filter(
      (item) =>
        item.guestName.toLowerCase().includes(q) ||
        item.flatNumber.toLowerCase().includes(q) ||
        item.residentName.toLowerCase().includes(q) ||
        item.purpose.toLowerCase().includes(q)
    );
  }, [periodBase, search]);

  return (
    <div className="space-y-4">
      <ListToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search guest, flat, resident, or purpose…"
        filters={[
          {
            id: "period",
            value: periodFilter,
            onChange: (v) => setPeriodFilter(v as VisitorPeriodFilter),
            placeholder: "Period",
            options: [...PERIOD_OPTIONS],
          },
        ]}
        resultCount={{ shown: filtered.length, total: periodBase.length }}
      />

      {filtered.length === 0 ? (
        <div className="surface-card px-4 py-8 text-center text-sm text-muted-foreground">
          No visitor requests for this period
        </div>
      ) : (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Visitor requests
          </h2>
          <ul className="surface-card divide-y">
            {filtered.map((item) => (
              <li key={item.id}>
                <Link
                  href={routes.dashboard.inspector.visitors.detail(item.id)}
                  className="block px-4 py-4 transition-colors hover:bg-muted/40"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">{item.guestName}</p>
                    <Badge
                      variant={
                        item.status === "pending" ? "secondary" : "outline"
                      }
                    >
                      {statusLabel[item.status]}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Flat {item.flatNumber} · {item.residentName}
                  </p>
                  <p className="mt-0.5 text-sm">{item.purpose}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Expected {formatDate(item.expectedDate)} · {item.expectedTime}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
