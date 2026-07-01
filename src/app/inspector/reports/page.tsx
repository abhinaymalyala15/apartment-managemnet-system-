import { InspectorSubpageLayout } from "@/components/inspector/inspector-subpage-layout";
import { OccupancyBar } from "@/components/dashboard/occupancy-bar";
import {
  getApartmentStats,
  getMaintenanceSummary,
  getMaintenanceStats,
  formatCurrency,
} from "@/lib/data";

export default function InspectorReportsPage() {
  const stats = getApartmentStats();
  const summary = getMaintenanceSummary();
  const { paidCount, pendingCount, overdueCount } = getMaintenanceStats();

  return (
    <InspectorSubpageLayout
      title="Reports"
      description="Summary statistics for the society. For individual flat details, use All flats or Unpaid bills."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Occupancy",
            value: `${Math.round((stats.occupiedFlats / stats.totalFlats) * 100)}%`,
            sub: `${stats.occupiedFlats} of ${stats.totalFlats} flats`,
          },
          {
            label: "Collection",
            value: `${summary.collectionRate}%`,
            sub: summary.month,
          },
          {
            label: "Collected",
            value: formatCurrency(summary.totalCollected),
            sub: "This cycle",
          },
          {
            label: "Outstanding",
            value: formatCurrency(summary.totalOutstanding),
            sub: "Still owed",
          },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl border bg-card p-5 shadow-sm"
          >
            <p className="text-xs font-medium text-muted-foreground">
              {item.label}
            </p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">
              {item.value}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">{item.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="font-semibold">Occupancy</h2>
          <div className="mt-4 space-y-4">
            <OccupancyBar
              occupied={stats.occupiedFlats}
              total={stats.totalFlats}
            />
            <dl className="grid grid-cols-2 gap-3 text-sm">
              {[
                ["Owner-occupied", stats.ownerOccupied],
                ["Tenant-occupied", stats.tenantOccupied],
                ["Vacant", stats.vacantFlats],
                ["Total flats", stats.totalFlats],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="font-medium tabular-nums">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="font-semibold">Payment records</h2>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            {[
              ["Paid", paidCount],
              ["Pending", pendingCount],
              ["Overdue", overdueCount],
              [
                "Monthly charge",
                formatCurrency(summary.monthlyMaintenancePerFlat ?? 1300),
              ],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="font-medium">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </InspectorSubpageLayout>
  );
}
