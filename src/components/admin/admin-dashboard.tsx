import Link from "next/link";
import {
  Building2,
  Layers,
  Home,
  Users,
  ClipboardList,
  AlertCircle,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { routes } from "@/config/routes";
import type { AdminDashboardSummary } from "@/lib/admin-portal-data";
import { Badge } from "@/components/ui/badge";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import {
  AdminHintBanner,
  AdminSectionLabel,
  AdminStatCard,
} from "@/components/admin/ui/admin-primitives";

interface AdminDashboardProps {
  summary: AdminDashboardSummary;
}

const STAT_ACCENTS = ["primary", "primary", "success", "warning", "muted"] as const;

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
      <AdminPageHeader
        title={summary.apartmentName}
        description="Configure the apartment so inspectors can run daily operations."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map(({ label, value, icon }, index) => (
          <AdminStatCard
            key={label}
            label={label}
            value={value}
            icon={icon}
            accent={STAT_ACCENTS[index]}
          />
        ))}
      </div>

      {summary.pendingTasks.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <AdminSectionLabel>Pending configuration</AdminSectionLabel>
            <Badge className="bg-amber-500/15 text-[10px] font-bold text-amber-700 hover:bg-amber-500/15">
              {summary.pendingConfigCount}
            </Badge>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {summary.pendingTasks.map((task) => (
              <Link key={task.id} href={task.href} className="admin-action-card group">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400/20 to-amber-500/10">
                  <AlertCircle className="h-6 w-6 text-amber-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold leading-snug text-slate-900">{task.label}</p>
                  <p className="mt-0.5 text-xs text-slate-500">Requires setup</p>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
              </Link>
            ))}
          </div>
        </section>
      )}

      <AdminHintBanner>
        Payments, complaints, visitors, and reports are handled in the{" "}
        <Link
          href={routes.dashboard.inspector.root}
          className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
        >
          Inspector Portal
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
        .
      </AdminHintBanner>
    </div>
  );
}
