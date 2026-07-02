import Link from "next/link";
import { ChevronRight, Layers, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { routes } from "@/config/routes";
import type { AdminBlockSummary } from "@/lib/admin-portal-data";

interface AdminBlocksWorkspaceProps {
  blocks: AdminBlockSummary[];
}

export function AdminBlocksWorkspace({ blocks }: AdminBlocksWorkspaceProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          Create blocks, define floors, and generate flat numbers in bulk.
        </p>
        <Button size="sm">
          <Plus className="mr-1.5 h-4 w-4" />
          Add block
        </Button>
      </div>

      <div className="surface-card overflow-hidden">
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
                    {block.needsGeneration && (
                      <Badge variant="outline" className="text-[10px] text-amber-700">
                        Needs flats
                      </Badge>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">{block.description}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Layers className="h-3.5 w-3.5" />
                      {block.floorCount} floors
                    </span>
                    <span>{block.flatCount} flats</span>
                    {block.flatsPerFloor > 0 && (
                      <span>{block.flatsPerFloor} per floor</span>
                    )}
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <Link
        href={routes.dashboard.admin.flats.root}
        className="surface-card flex items-center gap-4 p-5 transition-colors hover:bg-muted/30"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium">Flat builder</p>
          <p className="text-sm text-muted-foreground">
            Auto-generate 101–111, 201–211 across floors instead of creating flats one by one.
          </p>
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
      </Link>
    </div>
  );
}
