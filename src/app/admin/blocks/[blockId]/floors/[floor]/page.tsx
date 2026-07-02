import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { AdminFloorDetailWorkspace } from "@/components/admin/blocks/admin-floor-detail-workspace";
import {
  getBlockByIdOrThrow,
  getFlatsForFloor,
} from "@/lib/admin-portal-data";
import { routes } from "@/config/routes";

interface AdminFloorPageProps {
  params: Promise<{ blockId: string; floor: string }>;
}

export default async function AdminFloorPage({ params }: AdminFloorPageProps) {
  const { blockId, floor: floorParam } = await params;
  const floor = Number(floorParam);
  const block = getBlockByIdOrThrow(blockId);
  const flats = getFlatsForFloor(blockId, floor);

  return (
    <div className="page-stack pb-8">
      <Link
        href={routes.dashboard.admin.blocks.detail(blockId)}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        {block.name}
      </Link>
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Floor {floor}</h1>
      </header>
      <AdminFloorDetailWorkspace
        blockName={block.name}
        blockId={blockId}
        floor={floor}
        flats={flats}
      />
    </div>
  );
}
