import { DashboardLayout } from "@/components/layouts/dashboard-layout";

export default function InspectorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout role="inspector">{children}</DashboardLayout>;
}
