import { ReportBlockList } from "@/components/inspector/reports/report-block-list";
import type { MovementReportData } from "@/types";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";

interface MovementReportViewProps {
  data: MovementReportData;
}

export function MovementReportView({ data }: MovementReportViewProps) {
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Household changes in{" "}
        <span className="font-medium text-foreground">{data.context.label}</span>{" "}
        · last 90 days
      </p>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <ArrowDownLeft className="h-4 w-4 text-emerald-600" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Move-ins
            </h2>
          </div>
          <ReportBlockList
            title=""
            rows={data.moveIns}
            emptyMessage="No move-ins in this block."
          />
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <ArrowUpRight className="h-4 w-4 text-amber-600" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Move-outs
            </h2>
          </div>
          <ReportBlockList
            title=""
            rows={data.moveOuts}
            emptyMessage="No move-outs in this block."
          />
        </div>
      </div>
    </div>
  );
}
