import { notFound } from "next/navigation";
import { AdminSubpageLayout } from "@/components/inspector/admin-shell";
import { FloorViewGrid } from "@/components/inspector/floor/floor-view-grid";
import { getFloorViewData } from "@/lib/explorer-data";
import { getBlocks, getFlatsByBlock } from "@/lib/data";

interface FloorPageProps {
  params: Promise<{ blockId: string; floor: string }>;
}

export function generateStaticParams() {
  const params: { blockId: string; floor: string }[] = [];
  for (const block of getBlocks()) {
    const floors = new Set(getFlatsByBlock(block.id).map((f) => f.floor));
    for (const floor of floors) {
      params.push({ blockId: block.id, floor: String(floor) });
    }
  }
  return params;
}

export default async function AdminFloorPage({ params }: FloorPageProps) {
  const { blockId, floor: floorStr } = await params;
  const floor = Number(floorStr);
  if (Number.isNaN(floor)) notFound();

  const data = getFloorViewData(blockId, floor);
  if (!data) notFound();

  return (
    <AdminSubpageLayout
      title={`${data.blockName} · Floor ${data.floor}`}
      description="Visual floor layout — click any flat to open Flat Operations (Phase 7D)."
      backHref={`/inspector/blocks/${blockId}`}
      backLabel={data.blockName}
    >
      <FloorViewGrid data={data} />
    </AdminSubpageLayout>
  );
}
