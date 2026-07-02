import { notFound } from "next/navigation";
import { FlatOperationsHub } from "@/components/inspector/flat/flat-operations-hub";
import { getFlatOperationsData } from "@/lib/flat-ops-data";
import { getFlats } from "@/lib/data";

interface FlatPageProps {
  params: Promise<{ flatId: string }>;
}

export function generateStaticParams() {
  return getFlats().map((flat) => ({ flatId: flat.id }));
}

export default async function AdminFlatPage({ params }: FlatPageProps) {
  const { flatId } = await params;
  const data = getFlatOperationsData(flatId);

  if (!data) notFound();

  return <FlatOperationsHub data={data} />;
}
