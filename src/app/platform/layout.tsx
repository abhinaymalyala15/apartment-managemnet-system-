import { DashboardLayout } from "@/components/layouts/dashboard-layout";

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout role="platform">{children}</DashboardLayout>;
}
