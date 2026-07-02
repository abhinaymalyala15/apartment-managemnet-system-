"use client";

import { ResidentDirectory } from "@/components/shared/resident-directory";
import { routes } from "@/config/routes";
import type { ResidentTableRow } from "@/lib/data";

interface ResidentDirectoryPanelProps {
  rows: ResidentTableRow[];
}

export function ResidentDirectoryPanel({ rows }: ResidentDirectoryPanelProps) {
  return (
    <ResidentDirectory
      rows={rows}
      getFlatHref={(flatId) => routes.dashboard.inspector.flats.detail(flatId)}
      showMaintenanceFilter={false}
      showMaintenanceOnRow={false}
      useShortOccupancyLabel
      searchPlaceholder="Search by name or phone number…"
      occupancyFilterOptions={[
        { value: "all", label: "All" },
        { value: "owner_occupied", label: "Owner" },
        { value: "tenant_occupied", label: "Rent" },
      ]}
    />
  );
}
