import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { AssetProfileView } from "@/components/inspector/facility/asset-profile-view";
import {
  getFacilityAssetProfile,
  getCommunityAssets,
} from "@/lib/asset-data";
import { routes } from "@/config/routes";

interface AssetPageProps {
  params: Promise<{ assetId: string }>;
}

export function generateStaticParams() {
  return getCommunityAssets().map((asset) => ({ assetId: asset.id }));
}

export default async function ServicesAssetPage({ params }: AssetPageProps) {
  const { assetId } = await params;
  const profile = getFacilityAssetProfile(assetId);

  if (!profile) notFound();

  return (
    <div className="space-y-6">
      <Link
        href={routes.dashboard.inspector.services.assets}
        className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        All assets
      </Link>
      <header>
        <h2 className="text-xl font-semibold tracking-tight">{profile.name}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {profile.location}
        </p>
      </header>
      <AssetProfileView profile={profile} />
    </div>
  );
}
