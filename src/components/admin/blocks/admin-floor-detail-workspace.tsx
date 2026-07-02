import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { routes } from "@/config/routes";
import type { Flat } from "@/types";

interface AdminFloorDetailWorkspaceProps {
  blockName: string;
  blockId: string;
  floor: number;
  flats: Flat[];
}

const statusLabel: Record<Flat["occupancyStatus"], string> = {
  vacant: "Vacant",
  owner_occupied: "Owner",
  tenant_occupied: "Tenant",
};

export function AdminFloorDetailWorkspace({
  blockName,
  blockId,
  floor,
  flats,
}: AdminFloorDetailWorkspaceProps) {
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        {blockName} · Floor {floor} · {flats.length} flat(s)
      </p>

      {flats.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-muted/20 px-6 py-10 text-center text-sm text-muted-foreground">
          No flats on this floor yet. Use the{" "}
          <Link href={routes.dashboard.admin.flats.root} className="text-primary hover:underline">
            flat builder
          </Link>{" "}
          to generate them.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {flats.map((flat) => (
            <Link
              key={flat.id}
              href={routes.dashboard.admin.flats.detail(flat.id)}
              className="surface-card p-4 transition-colors hover:bg-muted/30"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-lg font-semibold tabular-nums">{flat.flatNumber}</span>
                <Badge variant="outline" className="text-[10px]">
                  {statusLabel[flat.occupancyStatus]}
                </Badge>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {flat.flatType} · {flat.areaSqft} sq.ft
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
