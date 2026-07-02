import type { OccupancyStatus } from "@/types";

export function getOccupancyLabel(status: OccupancyStatus): string {
  const labels: Record<OccupancyStatus, string> = {
    vacant: "Vacant",
    owner_occupied: "Owner Occupied",
    tenant_occupied: "Tenant Occupied",
  };
  return labels[status];
}

export function getOccupancyVariant(
  status: OccupancyStatus
): "default" | "secondary" | "outline" | "destructive" {
  const variants: Record<
    OccupancyStatus,
    "default" | "secondary" | "outline" | "destructive"
  > = {
    vacant: "outline",
    owner_occupied: "default",
    tenant_occupied: "secondary",
  };
  return variants[status];
}

export function getResidentTypeLabel(
  status: OccupancyStatus
): "Owner" | "Tenant" | "Vacant" {
  const labels: Record<OccupancyStatus, "Owner" | "Tenant" | "Vacant"> = {
    owner_occupied: "Owner",
    tenant_occupied: "Tenant",
    vacant: "Vacant",
  };
  return labels[status];
}

export function getResidentDirectoryLabel(
  status: OccupancyStatus
): "Owner" | "Rent" | "Vacant" {
  const labels: Record<OccupancyStatus, "Owner" | "Rent" | "Vacant"> = {
    owner_occupied: "Owner",
    tenant_occupied: "Rent",
    vacant: "Vacant",
  };
  return labels[status];
}
