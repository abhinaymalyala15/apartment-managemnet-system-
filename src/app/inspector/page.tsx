import { AdminTodayDashboardView } from "@/components/inspector/admin-today-dashboard";
import { getAdminTodayDashboard } from "@/lib/admin-data";

export default function AdminDashboardPage() {
  const data = getAdminTodayDashboard();

  return (
    <div className="page-stack pb-8">
      <header>
        <h1 className="page-title">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Priorities and recent activity across the society
        </p>
      </header>

      <AdminTodayDashboardView data={data} />
    </div>
  );
}
