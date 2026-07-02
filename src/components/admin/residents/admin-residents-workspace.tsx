"use client";

import Link from "next/link";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { routes } from "@/config/routes";
import type { FlatAssignmentRow } from "@/lib/admin-portal-data";

interface AdminResidentsWorkspaceProps {
  rows: FlatAssignmentRow[];
}

const statusVariant: Record<
  FlatAssignmentRow["occupancyStatus"],
  "default" | "secondary" | "outline"
> = {
  vacant: "outline",
  owner_occupied: "secondary",
  tenant_occupied: "default",
};

export function AdminResidentsWorkspace({ rows }: AdminResidentsWorkspaceProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          Master resident assignment — owner, tenant, and family. Inspectors update daily details.
        </p>
        <Button size="sm">
          <UserPlus className="mr-1.5 h-4 w-4" />
          Assign resident
        </Button>
      </div>

      <div className="surface-card overflow-hidden">
        <div className="hidden grid-cols-[80px_1fr_1fr_1fr_100px] gap-4 border-b px-4 py-2.5 text-xs font-medium text-muted-foreground sm:grid sm:px-5">
          <span>Flat</span>
          <span>Owner</span>
          <span>Tenant</span>
          <span>Block</span>
          <span>Status</span>
        </div>
        <ul className="divide-y">
          {rows.map((row) => (
            <li key={row.flatId}>
              <Link
                href={row.href}
                className="flex flex-col gap-2 px-4 py-3.5 transition-colors hover:bg-muted/50 sm:grid sm:grid-cols-[80px_1fr_1fr_1fr_100px] sm:items-center sm:gap-4 sm:px-5"
              >
                <span className="font-medium tabular-nums">{row.flatNumber}</span>
                <span className="text-sm text-muted-foreground sm:text-foreground">
                  {row.ownerName ?? "—"}
                </span>
                <span className="text-sm text-muted-foreground sm:text-foreground">
                  {row.tenantName ?? "—"}
                </span>
                <span className="text-sm text-muted-foreground">{row.blockName}</span>
                <Badge variant={statusVariant[row.occupancyStatus]} className="w-fit text-[10px]">
                  {row.occupancyStatus.replace("_", " ")}
                </Badge>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <p className="text-xs text-muted-foreground">
        Move-in and move-out workflows are initiated here. For day-to-day resident updates, use{" "}
        <Link href={routes.dashboard.inspector.residents} className="text-primary hover:underline">
          Inspector → Residents
        </Link>
        .
      </p>
    </div>
  );
}
