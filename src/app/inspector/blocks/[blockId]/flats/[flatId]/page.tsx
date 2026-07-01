import { redirect } from "next/navigation";

interface LegacyFlatDetailPageProps {
  params: Promise<{ blockId: string; flatId: string }>;
}

export default async function LegacyInspectorFlatDetailPage({
  params,
}: LegacyFlatDetailPageProps) {
  const { flatId } = await params;
  redirect(`/inspector/flats/${flatId}`);
}
