import { notFound } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { FlatsTable } from "@/components/inspector/flats-table";
import { getBlockById } from "@/lib/data";

interface BlockPageProps {
  params: Promise<{ blockId: string }>;
}

export default async function InspectorBlockPage({ params }: BlockPageProps) {
  const { blockId } = await params;
  const block = getBlockById(blockId);

  if (!block) notFound();

  return (
    <>
      <PageHeader
        title={block.name}
        subtitle={`${block.totalFlats} flats across ${block.floorCount} floors`}
      />

      <div className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8">
        <FlatsTable blockId={block.id} />
      </div>
    </>
  );
}
