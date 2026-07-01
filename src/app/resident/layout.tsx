import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { ResidentBottomNav } from "@/components/resident/resident-bottom-nav";

export default function ResidentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout role="resident" footer={<ResidentBottomNav />}>
      {children}
    </DashboardLayout>
  );
}
