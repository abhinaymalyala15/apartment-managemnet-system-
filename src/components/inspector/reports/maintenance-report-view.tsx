import { StatCard } from "@/components/dashboard/stat-card";
import { ReportBlockList } from "@/components/inspector/reports/report-block-list";
import { formatCurrency } from "@/lib/data";
import type { MaintenanceReportData } from "@/types";
import { AlertTriangle, CheckCircle2, Clock, Wallet } from "lucide-react";

interface MaintenanceReportViewProps {
  data: MaintenanceReportData;
}

export function MaintenanceReportView({ data }: MaintenanceReportViewProps) {
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Showing maintenance for{" "}
        <span className="font-medium text-foreground">{data.context.label}</span>
      </p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Outstanding"
          value={formatCurrency(data.outstanding)}
          description="Open bills"
          icon={Wallet}
          className="p-4"
        />
        <StatCard
          title="Overdue flats"
          value={data.overdueCount}
          description="Needs follow-up"
          icon={AlertTriangle}
          className={
            data.overdueCount > 0 ? "border-destructive/30 p-4" : "p-4"
          }
        />
        <StatCard
          title="Pending bills"
          value={data.pendingCount}
          description="Before due date"
          icon={Clock}
          className="p-4"
        />
        <StatCard
          title="Paid"
          value={data.paidCount}
          description="Settled bills"
          icon={CheckCircle2}
          className="p-4"
        />
      </div>

      <ReportBlockList
        title={`Open maintenance · ${data.context.label}`}
        rows={data.flatRows}
        emptyMessage="No open maintenance bills in this block."
      />
    </div>
  );
}
