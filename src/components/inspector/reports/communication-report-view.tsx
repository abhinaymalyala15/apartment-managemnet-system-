import { StatCard } from "@/components/dashboard/stat-card";
import { ReportBlockList } from "@/components/inspector/reports/report-block-list";
import type { CommunicationReportData } from "@/types";
import { AlertTriangle, Megaphone } from "lucide-react";

interface CommunicationReportViewProps {
  data: CommunicationReportData;
}

export function CommunicationReportView({ data }: CommunicationReportViewProps) {
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Society notices sent to all residents including{" "}
        <span className="font-medium text-foreground">{data.context.label}</span>
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        <StatCard
          title="Published notices"
          value={data.publishedCount}
          description="Sent to residents"
          icon={Megaphone}
          className="p-4"
        />
        <StatCard
          title="Emergency"
          value={data.emergencyCount}
          description="Critical alerts"
          icon={AlertTriangle}
          className={
            data.emergencyCount > 0 ? "border-destructive/30 p-4" : "p-4"
          }
        />
      </div>

      <ReportBlockList
        title="Recent notices"
        rows={data.byCategory}
        emptyMessage="No notices published."
      />
    </div>
  );
}
