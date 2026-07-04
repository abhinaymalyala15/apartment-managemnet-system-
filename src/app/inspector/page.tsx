import { AdminTodayDashboardView } from "@/components/inspector/admin-today-dashboard";
import { getAdminTodayDashboard } from "@/lib/admin-data";

export default function AdminDashboardPage() {
  const data = getAdminTodayDashboard();

  return (
    <div className="space-y-5 pb-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-[1.625rem]">Dashboard</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Priorities and recent activity across the society
          </p>
        </div>
      </header>

      <AdminTodayDashboardView data={data} />
    </div>
  );
}
