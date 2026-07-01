import { InspectorSubpageLayout } from "@/components/inspector/inspector-subpage-layout";
import { AllFlatsTable } from "@/components/inspector/all-flats-table";
import { getApartmentStats, getFlatsTableRows } from "@/lib/data";

export default function InspectorAllFlatsPage() {
  const stats = getApartmentStats();
  const rows = getFlatsTableRows();

  return (
    <InspectorSubpageLayout
      title="All flats"
      description={`${stats.totalFlats} flats in the society. Select any row to view the resident, family members, and pending bills for that flat.`}
    >
      <AllFlatsTable rows={rows} />
    </InspectorSubpageLayout>
  );
}
