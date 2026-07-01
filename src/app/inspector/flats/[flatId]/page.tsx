import { notFound } from "next/navigation";
import { InspectorSubpageLayout } from "@/components/inspector/inspector-subpage-layout";
import { InspectorFlatDetail } from "@/components/inspector/inspector-flat-detail";
import { getFlatById, getBlockById, getFlats } from "@/lib/data";

interface FlatDetailPageProps {
  params: Promise<{ flatId: string }>;
}

export function generateStaticParams() {
  return getFlats().map((flat) => ({ flatId: flat.id }));
}

export default async function InspectorFlatPage({ params }: FlatDetailPageProps) {
  const { flatId } = await params;
  const flat = getFlatById(flatId);
  const block = flat ? getBlockById(flat.blockId) : undefined;

  if (!flat || !block) notFound();

  return (
    <InspectorSubpageLayout
      title={`Flat ${flat.flatNumber}`}
      description={`${block.name}, floor ${flat.floor} — resident, family members, and pending bills.`}
      backHref="/inspector/flats"
      backLabel="All flats"
      narrow
    >
      <InspectorFlatDetail flatId={flatId} />
    </InspectorSubpageLayout>
  );
}
