"use client";

import { useMemo, useState } from "react";
import { Radio, Wrench } from "lucide-react";
import { ListToolbar } from "@/components/ui/list-toolbar";
import { Badge } from "@/components/ui/badge";
import {
  filterAssetServicesByPeriod,
  formatDate,
  getAssetServices,
  getServiceTiming,
  type ServicePeriodFilter,
} from "@/lib/asset-data";
import type { AssetServiceRecord } from "@/types";
import { cn } from "@/lib/utils";

const PERIOD_OPTIONS = [
  { value: "all", label: "All" },
  { value: "week", label: "This week" },
  { value: "month", label: "This month" },
] as const;

export function ServicesWorkspace() {
  const [periodFilter, setPeriodFilter] = useState<ServicePeriodFilter>("all");
  const [search, setSearch] = useState("");

  const allServices = useMemo(() => getAssetServices(), []);

  const periodBase = useMemo(
    () => filterAssetServicesByPeriod(allServices, periodFilter),
    [allServices, periodFilter]
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return periodBase;
    const q = search.toLowerCase();
    return periodBase.filter(
      (service) =>
        service.title.toLowerCase().includes(q) ||
        service.vendor.toLowerCase().includes(q) ||
        service.description.toLowerCase().includes(q) ||
        service.technician?.toLowerCase().includes(q)
    );
  }, [periodBase, search]);

  const grouped = useMemo(() => {
    const happening: AssetServiceRecord[] = [];
    const upcoming: AssetServiceRecord[] = [];
    const past: AssetServiceRecord[] = [];

    for (const service of filtered) {
      const timing = getServiceTiming(service);
      if (timing === "happening") happening.push(service);
      else if (timing === "upcoming") upcoming.push(service);
      else past.push(service);
    }

    upcoming.sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate));
    past.sort((a, b) => {
      const dateA = a.completedDate ?? a.scheduledDate;
      const dateB = b.completedDate ?? b.scheduledDate;
      return dateB.localeCompare(dateA);
    });

    return { happening, upcoming, past };
  }, [filtered]);

  const isEmpty =
    grouped.happening.length === 0 &&
    grouped.upcoming.length === 0 &&
    grouped.past.length === 0;

  return (
    <div className="space-y-4">
      <ListToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search service, vendor, or technician…"
        filters={[
          {
            id: "period",
            value: periodFilter,
            onChange: (v) => setPeriodFilter(v as ServicePeriodFilter),
            placeholder: "Period",
            options: [...PERIOD_OPTIONS],
          },
        ]}
        resultCount={{ shown: filtered.length, total: periodBase.length }}
      />

      {isEmpty ? (
        <div className="surface-card flex flex-col items-center gap-2 px-4 py-10 text-center text-sm text-muted-foreground">
          <Wrench className="h-8 w-8 opacity-40" />
          No services for this period
        </div>
      ) : (
        <div className="space-y-8">
          {grouped.happening.length > 0 && (
            <ServiceSection
              title="Happening now"
              highlight
              services={grouped.happening}
            />
          )}
          {grouped.upcoming.length > 0 && (
            <ServiceSection title="Upcoming services" services={grouped.upcoming} />
          )}
          {grouped.past.length > 0 && (
            <ServiceSection title="Past services" services={grouped.past} muted />
          )}
        </div>
      )}
    </div>
  );
}

function ServiceSection({
  title,
  services,
  highlight = false,
  muted = false,
}: {
  title: string;
  services: AssetServiceRecord[];
  highlight?: boolean;
  muted?: boolean;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <h2
          className={cn(
            "text-sm font-semibold uppercase tracking-wider",
            highlight ? "text-primary" : "text-muted-foreground"
          )}
        >
          {title}
        </h2>
        {highlight && (
          <Badge className="gap-1 bg-primary text-[10px] text-primary-foreground">
            <Radio className="h-3 w-3" />
            Live
          </Badge>
        )}
        <span className="text-xs text-muted-foreground">({services.length})</span>
      </div>
      <ul
        className={cn(
          "divide-y rounded-xl border bg-card",
          highlight && "border-primary/40 ring-2 ring-primary/20",
          muted && "opacity-90"
        )}
      >
        {services.map((service) => (
          <ServiceRow key={service.id} service={service} highlight={highlight} />
        ))}
      </ul>
    </section>
  );
}

function ServiceRow({
  service,
  highlight,
}: {
  service: AssetServiceRecord;
  highlight?: boolean;
}) {
  const timing = getServiceTiming(service);
  const isPast = timing === "past";
  const dateLabel =
    service.status === "completed" && service.completedDate
      ? `Completed ${formatDate(service.completedDate)}`
      : `Scheduled ${formatDate(service.scheduledDate)}`;

  return (
    <li>
      <article
        className={cn(
          "px-4 py-4",
          highlight && "bg-primary/5",
          isPast && "bg-muted/20"
        )}
      >
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h3 className="font-semibold leading-snug">{service.title}</h3>
          <StatusPill status={service.status} happening={timing === "happening"} />
        </div>

        <p className="mt-2 text-sm font-medium">{service.vendor}</p>

        <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              When
            </dt>
            <dd className="mt-0.5">
              {dateLabel}
              {service.scheduledTime && !isPast && (
                <span className="text-muted-foreground">
                  {" "}
                  · {service.scheduledTime}
                </span>
              )}
            </dd>
          </div>
          {service.technician && (
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Technician
              </dt>
              <dd className="mt-0.5">{service.technician}</dd>
            </div>
          )}
        </dl>

        {service.description && (
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {service.description}
          </p>
        )}
      </article>
    </li>
  );
}

function StatusPill({
  status,
  happening,
}: {
  status: AssetServiceRecord["status"];
  happening?: boolean;
}) {
  if (happening) {
    return (
      <Badge className="shrink-0 bg-primary text-[10px] text-primary-foreground">
        Happening now
      </Badge>
    );
  }

  const labels: Record<AssetServiceRecord["status"], string> = {
    scheduled: "Scheduled",
    completed: "Completed",
    cancelled: "Cancelled",
    in_progress: "In progress",
  };

  return (
    <Badge
      variant={status === "completed" ? "default" : "outline"}
      className="shrink-0 text-[10px]"
    >
      {labels[status]}
    </Badge>
  );
}
