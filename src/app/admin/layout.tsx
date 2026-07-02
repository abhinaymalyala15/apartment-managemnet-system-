import { DashboardLayout } from "@/components/layouts/dashboard-layout";

export default function PlatformAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout role="admin">{children}</DashboardLayout>;
}
