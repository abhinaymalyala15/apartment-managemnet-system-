"use client";

import Link from "next/link";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { routes } from "@/config/routes";
import { AdminPanel } from "@/components/admin/ui/admin-primitives";
import type { FlatAssignmentRow } from "@/lib/admin-portal-data";
import { cn } from "@/lib/utils";

interface AdminResidentsWorkspaceProps {
  rows: FlatAssignmentRow[];
}

const statusStyle: Record<
  FlatAssignmentRow["occupancyStatus"],
  { variant: "default" | "secondary" | "outline"; className?: string }
> = {
  vacant: { variant: "outline" },
  owner_occupied: { variant: "secondary" },
  tenant_occupied: {
    variant: "default",
    className: "bg-primary/10 text-primary hover:bg-primary/10",
  },
};

export function AdminResidentsWorkspace({ rows }: AdminResidentsWorkspaceProps) {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          Master resident assignment — owner, tenant, and family. Inspectors update daily details.
        </p>
        <Button size="sm">
          <UserPlus className="mr-1.5 h-4 w-4" />
          Assign resident
        </Button>
      </div>

      <AdminPanel title="Flat assignments" description={`${rows.length} flats configured`} flush>
        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="admin-table-head">
                <th className="px-3 py-2.5 font-medium">Flat</th>
                <th className="px-3 py-2.5 font-medium">Owner</th>
                <th className="px-3 py-2.5 font-medium">Tenant</th>
                <th className="px-3 py-2.5 font-medium">Block</th>
                <th className="px-3 py-2.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((row) => (
                <tr key={row.flatId} className="admin-table-row">
                  <td className="px-3 py-3">
                    <Link
                      href={row.href}
                      className="font-semibold tabular-nums text-foreground hover:text-primary"
                    >
                      {row.flatNumber}
                    </Link>
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">{row.ownerName ?? "—"}</td>
                  <td className="px-3 py-3 text-muted-foreground">{row.tenantName ?? "—"}</td>
                  <td className="px-3 py-3 text-muted-foreground">{row.blockName}</td>
                  <td className="px-3 py-3">
                    <Badge
                      variant={statusStyle[row.occupancyStatus].variant}
                      className={cn("text-[10px]", statusStyle[row.occupancyStatus].className)}
                    >
                      {row.occupancyStatus.replace("_", " ")}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ul className="space-y-2 lg:hidden">
          {rows.map((row) => (
            <li key={row.flatId}>
              <Link
                href={row.href}
                className="block rounded-lg border border-border/60 bg-muted/20 p-3 transition-colors hover:bg-muted/40"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold tabular-nums">Flat {row.flatNumber}</p>
                    <p className="text-xs text-muted-foreground">{row.blockName}</p>
                  </div>
                  <Badge
                    variant={statusStyle[row.occupancyStatus].variant}
                    className={cn("text-[10px]", statusStyle[row.occupancyStatus].className)}
                  >
                    {row.occupancyStatus.replace("_", " ")}
                  </Badge>
                </div>
                <dl className="mt-2 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <dt className="text-muted-foreground">Owner</dt>
                    <dd className="font-medium">{row.ownerName ?? "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Tenant</dt>
                    <dd className="font-medium">{row.tenantName ?? "—"}</dd>
                  </div>
                </dl>
              </Link>
            </li>
          ))}
        </ul>
      </AdminPanel>

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
