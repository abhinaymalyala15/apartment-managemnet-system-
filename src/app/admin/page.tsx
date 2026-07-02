import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { getAdminDashboardSummary } from "@/lib/admin-portal-data";

export default function AdminDashboardPage() {
  return <AdminDashboard summary={getAdminDashboardSummary()} />;
}
