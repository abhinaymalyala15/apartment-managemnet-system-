import Link from "next/link";
import {
  Building2,
  Layers,
  Home,
  Users,
  ClipboardList,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { routes } from "@/config/routes";
import type { AdminDashboardSummary } from "@/lib/admin-portal-data";
import { Badge } from "@/components/ui/badge";

interface AdminDashboardProps {
  summary: AdminDashboardSummary;
}

export function AdminDashboard({ summary }: AdminDashboardProps) {
  const stats = [
    { label: "Blocks", value: summary.blockCount, icon: Building2 },
    { label: "Floors", value: summary.floorCount, icon: Layers },
    { label: "Flats", value: summary.flatCount, icon: Home },
    { label: "Residents", value: summary.residentCount, icon: Users },
    { label: "Inspectors", value: summary.inspectorCount, icon: ClipboardList },
  ];

  return (
    <div className="page-stack pb-8">
      <header>
        <p className="text-sm font-medium text-muted-foreground">Apartment Admin</p>
        <h1 className="page-title">{summary.apartmentName}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure the apartment so inspectors can run daily operations.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="surface-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Icon className="h-4 w-4" />
              <span className="text-xs font-medium">{label}</span>
            </div>
            <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
          </div>
        ))}
      </div>

      {summary.pendingTasks.length > 0 && (
        <div className="surface-card overflow-hidden">
          <div className="flex items-center justify-between border-b px-4 py-3 sm:px-5">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold">Pending configuration</h2>
              <Badge variant="secondary">{summary.pendingConfigCount}</Badge>
            </div>
          </div>
          <ul className="divide-y">
            {summary.pendingTasks.map((task) => (
              <li key={task.id}>
                <Link
                  href={task.href}
                  className="flex items-center justify-between gap-4 px-4 py-3.5 transition-colors hover:bg-muted/50 sm:px-5"
                >
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
                    <span className="text-sm font-medium">{task.label}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-xl border border-dashed bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
        Payments, complaints, visitors, and reports are handled in the{" "}
        <Link href={routes.dashboard.inspector.root} className="font-medium text-primary hover:underline">
          Inspector Portal
        </Link>
        .
      </div>
    </div>
  );
}
