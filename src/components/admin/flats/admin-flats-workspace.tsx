"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { previewGeneratedFlats } from "@/lib/admin-portal-data";
import type { AdminBlockSummary } from "@/lib/admin-portal-data";
import type { FlatAssignmentRow } from "@/lib/admin-portal-data";

interface AdminFlatsWorkspaceProps {
  blocks: AdminBlockSummary[];
  assignments: FlatAssignmentRow[];
}

export function AdminFlatsWorkspace({ blocks, assignments }: AdminFlatsWorkspaceProps) {
  const activeBlock = blocks.find((b) => b.flatCount > 0) ?? blocks[0];
  const [blockId, setBlockId] = useState(activeBlock?.id ?? "");
  const [floorCount, setFloorCount] = useState(activeBlock?.floorCount ?? 5);
  const [flatsPerFloor, setFlatsPerFloor] = useState(activeBlock?.flatsPerFloor || 11);

  const selectedBlock = blocks.find((b) => b.id === blockId);

  const preview = useMemo(
    () => previewGeneratedFlats(floorCount, flatsPerFloor),
    [floorCount, flatsPerFloor]
  );

  const totalFlats = floorCount * flatsPerFloor;

  return (
    <div className="space-y-8">
      <section className="surface-card p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold">Flat builder</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Generate hundreds of flats in seconds. Pick a block, set floors and flats per floor,
              and preview numbering before creating.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">Block</span>
            <select
              className="flex h-9 w-full rounded-lg border bg-background px-3 text-sm"
              value={blockId}
              onChange={(e) => {
                const block = blocks.find((b) => b.id === e.target.value);
                setBlockId(e.target.value);
                if (block) {
                  setFloorCount(block.floorCount);
                  setFlatsPerFloor(block.flatsPerFloor || 11);
                }
              }}
            >
              {blocks.map((block) => (
                <option key={block.id} value={block.id}>
                  {block.name}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">Floors</span>
            <input
              type="number"
              min={1}
              max={50}
              className="flex h-9 w-full rounded-lg border bg-background px-3 text-sm tabular-nums"
              value={floorCount}
              onChange={(e) => setFloorCount(Number(e.target.value))}
            />
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">Flats per floor</span>
            <input
              type="number"
              min={1}
              max={30}
              className="flex h-9 w-full rounded-lg border bg-background px-3 text-sm tabular-nums"
              value={flatsPerFloor}
              onChange={(e) => setFlatsPerFloor(Number(e.target.value))}
            />
          </label>
        </div>

        <div className="mt-6 rounded-lg bg-muted/40 p-4">
          <p className="text-sm font-medium">
            {selectedBlock?.name ?? "Block"} · {floorCount} floors · {flatsPerFloor} flats/floor →{" "}
            <span className="text-primary">{totalFlats} flats</span>
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {preview.slice(0, 5).map((row) => (
              <span
                key={row.floor}
                className="rounded-md border bg-background px-2.5 py-1 text-xs tabular-nums"
              >
                {row.flatNumbers[0]}–{row.flatNumbers[row.flatNumbers.length - 1]}
              </span>
            ))}
            {preview.length > 5 && (
              <span className="px-2 py-1 text-xs text-muted-foreground">
                +{preview.length - 5} more floors
              </span>
            )}
          </div>
        </div>

        <Button className="mt-4" size="sm">
          Generate {totalFlats} flats
        </Button>
      </section>

      <section className="surface-card overflow-hidden">
        <div className="border-b px-4 py-3 sm:px-5">
          <h2 className="font-semibold">All flats</h2>
          <p className="text-sm text-muted-foreground">{assignments.length} configured</p>
        </div>
        <ul className="max-h-[480px] divide-y overflow-y-auto">
          {assignments.map((row) => (
            <li key={row.flatId}>
              <Link
                href={row.href}
                className="flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-muted/50 sm:px-5"
              >
                <div>
                  <span className="font-medium tabular-nums">{row.flatNumber}</span>
                  <span className="ml-2 text-sm text-muted-foreground">{row.blockName}</span>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
