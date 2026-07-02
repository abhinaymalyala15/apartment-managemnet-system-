import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { StructureBlockSummary } from "@/types";
import { routes } from "@/config/routes";
import { Badge } from "@/components/ui/badge";

interface StructureWorkspaceProps {
  blocks: StructureBlockSummary[];
  stats: {
    blockCount: number;
    activeBlockCount: number;
    flatCount: number;
    floorCount: number;
    avgAreaSqft: number;
  };
  flatSummary: {
    totalFlats: number;
    byType: Array<{ type: string; count: number }>;
    defaultArea: number;
  };
}

export function StructureWorkspace({
  blocks,
  stats,
  flatSummary,
}: StructureWorkspaceProps) {
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Physical hierarchy configuration. Browse and operate via{" "}
        <Link href={routes.dashboard.inspector.root} className="text-primary hover:underline">
          Community Explorer
        </Link>
        .
      </p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Blocks", stats.blockCount],
          ["Active blocks", stats.activeBlockCount],
          ["Total flats", stats.flatCount],
          ["Avg area", `${stats.avgAreaSqft} sq.ft`],
        ].map(([label, value]) => (
          <div key={label} className="surface-card p-4">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
          </div>
        ))}
      </div>

      <div className="surface-card overflow-hidden">
        <div className="border-b px-4 py-3 sm:px-5">
          <h2 className="font-semibold">Blocks</h2>
          <p className="text-sm text-muted-foreground">
            Tap to open block dashboard and floor view.
          </p>
        </div>
        <ul className="divide-y">
          {blocks.map((block) => (
            <li key={block.id}>
              <Link
                href={block.href}
                className="flex items-center justify-between gap-4 px-4 py-4 transition-colors hover:bg-muted/50 sm:px-5"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{block.name}</p>
                    {block.flatCount === 0 && (
                      <Badge variant="outline" className="text-[10px]">
                        Planned
                      </Badge>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {block.description}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {block.floorCount} floors · {block.flatCount} flats ·{" "}
                    {block.occupiedCount} occupied · {block.vacantCount} vacant
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="surface-card p-5">
        <h2 className="font-semibold">Flat configuration</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Default area {flatSummary.defaultArea} sq.ft · {flatSummary.totalFlats}{" "}
          flats configured
        </p>
        <dl className="mt-4 grid gap-3 sm:grid-cols-3">
          {flatSummary.byType.map(({ type, count }) => (
            <div key={type} className="rounded-lg border px-4 py-3">
              <dt className="text-xs text-muted-foreground">{type}</dt>
              <dd className="text-lg font-semibold tabular-nums">{count}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
