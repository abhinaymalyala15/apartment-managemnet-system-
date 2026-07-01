import { InspectorShell } from "@/components/inspector/inspector-shell";
import { InspectorDashboardHero } from "@/components/inspector/inspector-dashboard-hero";
import { InspectorSection } from "@/components/inspector/inspector-section";
import { InspectorAttentionPanel } from "@/components/inspector/inspector-attention-panel";
import { InspectorBillingPanel } from "@/components/inspector/inspector-billing-panel";
import { InspectorOccupancyPanel } from "@/components/inspector/inspector-occupancy-panel";
import { InspectorActivityFeed } from "@/components/inspector/inspector-activity-feed";
import {
  getApartment,
  getApartmentStats,
  getMaintenanceSummary,
  getMaintenanceStats,
  getNotices,
  getServices,
} from "@/lib/data";

export default function InspectorDashboardPage() {
  const apartment = getApartment();
  const stats = getApartmentStats();
  const maintenance = getMaintenanceSummary();
  const { outstanding } = getMaintenanceStats();

  const residentMessages = getNotices()
    .filter((n) => n.category !== "maintenance")
    .slice(0, 3);

  const vendorVisits = getServices()
    .filter((s) => s.status === "scheduled")
    .slice(0, 3);

  return (
    <InspectorShell>
      <InspectorDashboardHero
        apartment={apartment}
        billingMonth={maintenance.month}
      />

      <div className="space-y-8">
        <InspectorSection
          title="Unpaid bills"
          hint="Flats that still owe maintenance this month."
        >
          <InspectorAttentionPanel
            outstanding={outstanding}
            totalOutstanding={maintenance.totalOutstanding}
          />
        </InspectorSection>

        <div className="grid gap-8 md:grid-cols-2">
          <InspectorSection
            title="Money"
            hint="Maintenance collected vs still owed."
          >
            <InspectorBillingPanel
              month={maintenance.month}
              collected={maintenance.totalCollected}
              outstanding={maintenance.totalOutstanding}
              collectionRate={maintenance.collectionRate}
            />
          </InspectorSection>

          <InspectorSection
            title="Flats"
            hint="How many flats are occupied or empty."
          >
            <InspectorOccupancyPanel
              totalFlats={stats.totalFlats}
              ownerOccupied={stats.ownerOccupied}
              tenantOccupied={stats.tenantOccupied}
              vacantFlats={stats.vacantFlats}
            />
          </InspectorSection>
        </div>

        <InspectorSection
          title="Updates"
          hint="Two different things: messages sent to residents, and vendor work scheduled on site."
        >
          <InspectorActivityFeed
            notices={residentMessages}
            services={vendorVisits}
          />
        </InspectorSection>
      </div>
    </InspectorShell>
  );
}
