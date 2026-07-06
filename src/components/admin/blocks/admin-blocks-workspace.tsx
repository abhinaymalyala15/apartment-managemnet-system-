import Link from "next/link";
import { Building2, ChevronRight, Layers, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { routes } from "@/config/routes";
import { AdminMetaChip } from "@/components/admin/ui/admin-primitives";
import type { AdminBlockSummary } from "@/lib/admin-portal-data";

interface AdminBlocksWorkspaceProps {
  blocks: AdminBlockSummary[];
}

export function AdminBlocksWorkspace({ blocks }: AdminBlocksWorkspaceProps) {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          Create blocks, define floors, and generate flat numbers in bulk.
        </p>
        <Button size="sm">
          <Plus className="mr-1.5 h-4 w-4" />
          Add block
        </Button>
      </div>

      <div className="grid gap-3">
        {blocks.map((block) => (
          <Link
            key={block.id}
            href={block.href}
            className="admin-action-card group items-center"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold">{block.name}</p>
                {block.needsGeneration && (
                  <Badge
                    variant="outline"
                    className="border-amber-200 bg-amber-50 text-[10px] text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300"
                  >
                    Needs flats
                  </Badge>
                )}
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">{block.description}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <AdminMetaChip icon={Layers}>{block.floorCount} floors</AdminMetaChip>
                <AdminMetaChip>{block.flatCount} flats</AdminMetaChip>
                {block.flatsPerFloor > 0 && (
                  <AdminMetaChip>{block.flatsPerFloor} per floor</AdminMetaChip>
                )}
              </div>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </Link>
        ))}
      </div>

      <Link
        href={routes.dashboard.admin.flats.root}
        className="admin-action-card group items-center border-primary/20 bg-primary/[0.03] hover:border-primary/30"
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">Flat builder</p>
          <p className="text-sm text-muted-foreground">
            Auto-generate 101–111, 201–211 across floors instead of creating flats one by one.
          </p>
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
}
