import { notFound } from "next/navigation";
import {
  AdminSubpageLayout,
} from "@/components/inspector/admin-shell";
import { BlockDashboard } from "@/components/inspector/block/block-dashboard";
import { getBlockDashboardSummary } from "@/lib/explorer-data";
import { getBlocks } from "@/lib/data";

interface BlockPageProps {
  params: Promise<{ blockId: string }>;
}

export function generateStaticParams() {
  return getBlocks().map((block) => ({ blockId: block.id }));
}

export default async function AdminBlockPage({ params }: BlockPageProps) {
  const { blockId } = await params;
  const summary = getBlockDashboardSummary(blockId);

  if (!summary) notFound();

  return (
    <AdminSubpageLayout
      title={`${summary.blockName} — Block Dashboard`}
      description="Mini operations center for this tower — collection, follow-ups, and services."
      backHref="/admin"
      backLabel="Dashboard"
    >
      <BlockDashboard summary={summary} />
    </AdminSubpageLayout>
  );
}
