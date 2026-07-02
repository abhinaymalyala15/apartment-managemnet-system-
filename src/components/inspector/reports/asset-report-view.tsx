import { StatCard } from "@/components/dashboard/stat-card";
import { ReportBlockList } from "@/components/inspector/reports/report-block-list";
import type { AssetReportData } from "@/types";
import { AlertTriangle, Clock, Package } from "lucide-react";

interface AssetReportViewProps {
  data: AssetReportData;
}

export function AssetReportView({ data }: AssetReportViewProps) {
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Showing assets for{" "}
        <span className="font-medium text-foreground">{data.context.label}</span>
      </p>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          title="Total assets"
          value={data.totalAssets}
          description="In this block"
          icon={Package}
          className="p-4"
        />
        <StatCard
          title="AMC overdue"
          value={data.amcOverdue}
          description="Renew immediately"
          icon={AlertTriangle}
          className={
            data.amcOverdue > 0 ? "border-destructive/30 p-4" : "p-4"
          }
        />
        <StatCard
          title="Service due soon"
          value={data.serviceDueSoon}
          description="Within window"
          icon={Clock}
          className="p-4"
        />
      </div>

      <ReportBlockList
        title={`Assets · ${data.context.label}`}
        rows={data.assetRows}
      />
    </div>
  );
}
