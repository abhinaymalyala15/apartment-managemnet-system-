"use client";

import { useMemo, useState } from "react";
import { ListToolbar } from "@/components/ui/list-toolbar";
import { EmptyState } from "@/components/ui/empty-state";
import { ServiceCardList } from "@/components/resident/service-card-list";
import { isServiceThisWeek, isServiceUpcoming } from "@/lib/data";
import type { Service } from "@/types";
import { Wrench } from "lucide-react";

interface FilterableServiceListProps {
  services: Service[];
}

type StatusFilter = "all" | Service["status"];
type ScopeFilter = "all" | "building" | "flat";
type SortKey = "date-asc" | "date-desc";

export function FilterableServiceList({ services }: FilterableServiceListProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("scheduled");
  const [scopeFilter, setScopeFilter] = useState<ScopeFilter>("all");
  const [sort, setSort] = useState<SortKey>("date-asc");

  const filtered = useMemo(() => {
    let list = [...services];

    if (statusFilter !== "all") {
      list = list.filter((s) => s.status === statusFilter);
    }
    if (scopeFilter === "building") {
      list = list.filter((s) => !s.flatId);
    } else if (scopeFilter === "flat") {
      list = list.filter((s) => Boolean(s.flatId));
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.vendor.toLowerCase().includes(q) ||
          s.serviceType.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      const diff =
        new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime();
      return sort === "date-asc" ? diff : -diff;
    });

    return list;
  }, [services, search, statusFilter, scopeFilter, sort]);

  const thisWeek = filtered.filter(isServiceThisWeek);
  const upcoming = filtered.filter(isServiceUpcoming);

  return (
    <div className="space-y-6">
      <ListToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search visits, vendor, or type…"
        filters={[
          {
            id: "status",
            value: statusFilter,
            onChange: (v) => setStatusFilter(v as StatusFilter),
            placeholder: "Status",
            options: [
              { value: "all", label: "All status" },
              { value: "scheduled", label: "Scheduled" },
              { value: "completed", label: "Completed" },
              { value: "cancelled", label: "Cancelled" },
            ],
          },
          {
            id: "scope",
            value: scopeFilter,
            onChange: (v) => setScopeFilter(v as ScopeFilter),
            placeholder: "Scope",
            options: [
              { value: "all", label: "All scope" },
              { value: "building", label: "Building-wide" },
              { value: "flat", label: "My flat only" },
            ],
          },
        ]}
        sort={{
          id: "sort",
          value: sort,
          onChange: (v) => setSort(v as SortKey),
          placeholder: "Sort",
          options: [
            { value: "date-asc", label: "Date ascending" },
            { value: "date-desc", label: "Date descending" },
          ],
        }}
        resultCount={{ shown: filtered.length, total: services.length }}
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title="No visits match"
          description="Try adjusting your search or filters."
        />
      ) : (
        <>
          {thisWeek.length > 0 && statusFilter !== "completed" && (
            <section className="space-y-3">
              <h3 className="section-title">This week</h3>
              <ServiceCardList services={thisWeek} showScope />
            </section>
          )}
          {upcoming.length > 0 && statusFilter !== "completed" && (
            <section className="space-y-3">
              <h3 className="section-title">Upcoming</h3>
              <ServiceCardList services={upcoming} showScope />
            </section>
          )}
          {(statusFilter === "completed" || statusFilter === "cancelled" || statusFilter === "all") && (
            <section className="space-y-3">
              <h3 className="section-title">
                {statusFilter === "completed" ? "Completed" : "All results"}
              </h3>
              <ServiceCardList
                services={filtered}
                showScope
                emptyMessage="No visits in this view."
              />
            </section>
          )}
        </>
      )}
    </div>
  );
}
