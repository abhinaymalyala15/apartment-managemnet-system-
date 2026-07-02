import { redirect } from "next/navigation";
import { routes } from "@/config/routes";

interface AssetRedirectProps {
  params: Promise<{ assetId: string }>;
}

export default async function AssetDetailRedirect({ params }: AssetRedirectProps) {
  const { assetId } = await params;
  redirect(`/inspector/services/assets/${assetId}`);
}
