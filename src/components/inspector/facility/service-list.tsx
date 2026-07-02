"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { useFacilityActions } from "@/components/inspector/facility/facility-provider";
import { formatDate, getFacilityScopeLabel } from "@/lib/asset-data";
import { routes } from "@/config/routes";
import type { AssetServiceRecord } from "@/types";
import { Wrench } from "lucide-react";

interface ServiceListProps {
  services: AssetServiceRecord[];
  compact?: boolean;
  showCompleted?: boolean;
}

export function ServiceList({
  services,
  compact,
  showCompleted,
}: ServiceListProps) {
  const { openAction } = useFacilityActions();

  if (services.length === 0) {
    return (
      <EmptyState
        icon={Wrench}
        title="No services"
        description="Schedule maintenance from the asset profile or quick actions."
        className="py-6"
      />
    );
  }

  return (
    <ul className="surface-card divide-y">
      {services.map((svc) => (
        <li
          key={svc.id}
          className="flex flex-wrap items-start justify-between gap-3 px-4 py-3"
        >
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-medium">{svc.title}</p>
              <StatusBadge status={svc.status} />
              <Badge variant="outline" className="text-[10px]">
                {getFacilityScopeLabel(svc.scope)}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {svc.vendor}
              {svc.scheduledTime && ` · ${svc.scheduledTime}`}
            </p>
            {!compact && svc.description && (
              <p className="mt-1 text-sm text-muted-foreground">
                {svc.description}
              </p>
            )}
            {!compact && svc.checklist && svc.checklist.length > 0 && (
              <p className="mt-2 text-xs text-muted-foreground">
                Checklist: {svc.checklist.join(" · ")}
              </p>
            )}
            {showCompleted && svc.remarks && (
              <p className="mt-1 text-xs text-muted-foreground">
                {svc.remarks}
              </p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              {svc.status === "completed" && svc.completedDate
                ? `Completed ${formatDate(svc.completedDate)}`
                : `Scheduled ${formatDate(svc.scheduledDate)}`}
              {svc.technician && ` · ${svc.technician}`}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            {svc.status === "scheduled" && (
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs"
                onClick={() =>
                  openAction("complete-service", { serviceId: svc.id })
                }
              >
                Complete
              </Button>
            )}
            {svc.assetId && (
              <Link
                href={routes.dashboard.inspector.services.asset(svc.assetId)}
                className="inline-flex h-8 items-center rounded-lg border px-3 text-xs font-medium hover:bg-muted"
              >
                View asset
              </Link>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

function StatusBadge({ status }: { status: AssetServiceRecord["status"] }) {
  const labels = {
    scheduled: "Scheduled",
    completed: "Completed",
    cancelled: "Cancelled",
    in_progress: "In progress",
  };
  const variant =
    status === "completed"
      ? "default"
      : status === "cancelled"
        ? "outline"
        : status === "in_progress"
          ? "secondary"
          : "secondary";
  return (
    <Badge variant={variant} className="text-[10px]">
      {labels[status]}
    </Badge>
  );
}
