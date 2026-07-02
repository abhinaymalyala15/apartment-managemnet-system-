import { AdminShell } from "@/components/inspector/admin-shell";
import { getAdminTodayDashboard, getAdminTopbarSummary } from "@/lib/admin-data";
import { getApartmentStats } from "@/lib/data";
import { getExplorerBlockList } from "@/lib/explorer-data";

export default function InspectorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { apartmentName, todayLabel } = getAdminTodayDashboard();
  const topbarSummary = getAdminTopbarSummary();
  const explorerBlocks = getExplorerBlockList();
  const stats = getApartmentStats();

  return (
    <AdminShell
      apartmentName={apartmentName}
      todayLabel={todayLabel}
      topbarSummary={topbarSummary}
      explorerBlocks={explorerBlocks}
      totalFlats={stats.totalFlats}
    >
      {children}
    </AdminShell>
  );
}
