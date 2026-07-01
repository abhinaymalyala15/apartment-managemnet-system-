import { DashboardPlaceholder } from "@/components/shared/dashboard-placeholder";
import { getApartment } from "@/lib/data";

export default function AdminDashboardPage() {
  const apartment = getApartment();

  return (
    <DashboardPlaceholder
      title="Apartment Admin Dashboard"
      description={`Manage ${apartment.name} — blocks, residents, maintenance, notices, and documents will be built in Phase 6.`}
      phase={6}
      phaseName="Apartment Admin Dashboard"
    />
  );
}
