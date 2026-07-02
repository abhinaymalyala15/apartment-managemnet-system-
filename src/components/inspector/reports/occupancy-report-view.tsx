import { OccupancyBar } from "@/components/dashboard/occupancy-bar";
import { StatCard } from "@/components/dashboard/stat-card";
import { ReportBlockList } from "@/components/inspector/reports/report-block-list";
import type { OccupancyReportData } from "@/types";
import { Home, UserCheck, Users } from "lucide-react";

interface OccupancyReportViewProps {
  data: OccupancyReportData;
}

export function OccupancyReportView({ data }: OccupancyReportViewProps) {
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Showing occupancy for{" "}
        <span className="font-medium text-foreground">{data.context.label}</span>
      </p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Occupancy rate"
          value={`${data.occupancyRate}%`}
          description={`${data.occupiedFlats} of ${data.totalFlats} flats`}
          icon={Users}
          className="p-4"
        />
        <StatCard
          title="Owner"
          value={data.ownerOccupied}
          description="Flats"
          icon={Home}
          className="p-4"
        />
        <StatCard
          title="Rent"
          value={data.tenantOccupied}
          description="Flats"
          icon={UserCheck}
          className="p-4"
        />
        <StatCard
          title="Vacant"
          value={data.vacantFlats}
          description="Flats"
          icon={Home}
          className={data.vacantFlats > 0 ? "border-amber-500/30 p-4" : "p-4"}
        />
      </div>

      <div className="surface-card p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Occupancy breakdown
        </h2>
        <div className="mt-4">
          <OccupancyBar occupied={data.occupiedFlats} total={data.totalFlats} />
        </div>
      </div>

      <ReportBlockList
        title={`Flats in ${data.context.label}`}
        rows={data.flatRows}
      />
    </div>
  );
}
