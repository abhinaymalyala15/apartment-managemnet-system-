import Link from "next/link";
import { ChevronRight, Layers, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { routes } from "@/config/routes";
import type { AdminBlockSummary } from "@/lib/admin-portal-data";
import type { GeneratedFloorPreview } from "@/lib/admin-portal-data";

interface AdminBlockDetailWorkspaceProps {
  block: AdminBlockSummary;
  floors: number[];
  preview: GeneratedFloorPreview[] | null;
}

export function AdminBlockDetailWorkspace({
  block,
  floors,
  preview,
}: AdminBlockDetailWorkspaceProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">{block.name}</h2>
            {block.needsGeneration && (
              <Badge variant="outline" className="text-amber-700">
                Flats not generated
              </Badge>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{block.description}</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            <Pencil className="mr-1.5 h-4 w-4" />
            Edit
          </Button>
          <Button variant="outline" size="sm" className="w-full text-destructive hover:text-destructive sm:w-auto">
            <Trash2 className="mr-1.5 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          ["Floors", block.floorCount],
          ["Flats", block.flatCount],
          ["Per floor", block.flatsPerFloor || "—"],
        ].map(([label, value]) => (
          <div key={label} className="surface-card p-4">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
          </div>
        ))}
      </div>

      {block.needsGeneration && preview && (
        <div className="surface-card p-5">
          <h3 className="font-semibold">Suggested flat numbers</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {block.floorCount} floors × {block.flatsPerFloor} flats →{" "}
            {preview.map((f) => f.flatNumbers.join("–")).join(", ")}
          </p>
          <Button className="mt-4" size="sm">
            Generate {block.floorCount * block.flatsPerFloor} flats
          </Button>
        </div>
      )}

      <div className="surface-card overflow-hidden">
        <div className="border-b px-4 py-3 sm:px-5">
          <h3 className="font-semibold">Floors</h3>
        </div>
        <ul className="divide-y">
          {floors.map((floor) => (
            <li key={floor}>
              <Link
                href={routes.dashboard.admin.blocks.floor(block.id, floor)}
                className="flex items-center justify-between gap-4 px-4 py-3.5 transition-colors hover:bg-muted/50 sm:px-5"
              >
                <div className="flex items-center gap-3">
                  <Layers className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Floor {floor}</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
