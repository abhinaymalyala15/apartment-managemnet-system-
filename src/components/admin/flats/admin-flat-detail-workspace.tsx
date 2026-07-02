"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Flat } from "@/types";
import type { Block } from "@/types";

interface AdminFlatDetailWorkspaceProps {
  flat: Flat;
  block: Block | undefined;
}

const statusLabel: Record<Flat["occupancyStatus"], string> = {
  vacant: "Vacant",
  owner_occupied: "Owner occupied",
  tenant_occupied: "Tenant occupied",
};

export function AdminFlatDetailWorkspace({ flat, block }: AdminFlatDetailWorkspaceProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold tabular-nums">Flat {flat.flatNumber}</h2>
            <Badge variant="outline">{statusLabel[flat.occupancyStatus]}</Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {block?.name ?? flat.blockId} · Floor {flat.floor}
          </p>
        </div>
        <Button size="sm">Edit flat details</Button>
      </div>

      <div className="surface-card p-6">
        <h3 className="font-semibold">Flat configuration</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Physical flat attributes only — owner and tenant assignment is under Residents.
        </p>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          {[
            ["Type", flat.flatType],
            ["Area", `${flat.areaSqft} sq.ft`],
            ["Bedrooms", String(flat.bedrooms)],
            ["Parking slots", String(flat.parkingSlots ?? 0)],
            ["Maintenance type", "Standard (area-based)"],
            ["Status", statusLabel[flat.occupancyStatus]],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
              <dd className="mt-0.5 font-medium">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
