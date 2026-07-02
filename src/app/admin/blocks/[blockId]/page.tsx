import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { AdminBlockDetailWorkspace } from "@/components/admin/blocks/admin-block-detail-workspace";
import {
  getAdminBlockSummaries,
  getBlockByIdOrThrow,
  getFloorsForBlock,
  previewGeneratedFlats,
} from "@/lib/admin-portal-data";
import { routes } from "@/config/routes";

interface AdminBlockDetailPageProps {
  params: Promise<{ blockId: string }>;
}

export default async function AdminBlockDetailPage({ params }: AdminBlockDetailPageProps) {
  const { blockId } = await params;
  const block =
    getAdminBlockSummaries().find((b) => b.id === blockId) ??
    (() => {
      const raw = getBlockByIdOrThrow(blockId);
      return {
        id: raw.id,
        name: raw.name,
        code: raw.code,
        floorCount: raw.floorCount,
        flatCount: 0,
        flatsPerFloor: raw.totalFlats > 0 ? Math.round(raw.totalFlats / raw.floorCount) : 0,
        description: raw.description,
        href: routes.dashboard.admin.blocks.detail(raw.id),
        needsGeneration: true,
      };
    })();

  const floors = getFloorsForBlock(blockId);
  const preview = block.needsGeneration
    ? previewGeneratedFlats(block.floorCount, block.flatsPerFloor || 11)
    : null;

  return (
    <div className="page-stack pb-8">
      <Link
        href={routes.dashboard.admin.blocks.root}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        Blocks
      </Link>
      <AdminBlockDetailWorkspace block={block} floors={floors} preview={preview} />
    </div>
  );
}
