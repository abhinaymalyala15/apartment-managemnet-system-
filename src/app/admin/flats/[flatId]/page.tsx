import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { AdminFlatDetailWorkspace } from "@/components/admin/flats/admin-flat-detail-workspace";
import { SettingsProvider } from "@/components/inspector/settings/settings-provider";
import { SettingsDrawers } from "@/components/inspector/settings/settings-drawers";
import { getFlatByIdOrThrow } from "@/lib/admin-portal-data";
import { getBlockById } from "@/lib/data";
import { routes } from "@/config/routes";

interface AdminFlatDetailPageProps {
  params: Promise<{ flatId: string }>;
}

export default async function AdminFlatDetailPage({ params }: AdminFlatDetailPageProps) {
  const { flatId } = await params;
  const flat = getFlatByIdOrThrow(flatId);
  const block = getBlockById(flat.blockId);

  return (
    <SettingsProvider>
      <div className="page-stack pb-8">
        <Link
          href={routes.dashboard.admin.flats.root}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Flats
        </Link>
        <AdminFlatDetailWorkspace flat={flat} block={block} />
      </div>
      <SettingsDrawers />
    </SettingsProvider>
  );
}
