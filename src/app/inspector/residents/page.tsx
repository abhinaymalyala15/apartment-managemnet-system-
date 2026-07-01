import { InspectorSubpageLayout } from "@/components/inspector/inspector-subpage-layout";
import { ResidentsTable } from "@/components/inspector/residents-table";
import { getResidentTableRows } from "@/lib/data";

export default function InspectorResidentsPage() {
  const rows = getResidentTableRows();

  return (
    <InspectorSubpageLayout
      title="Find people"
      description="Search by resident name or flat number. For a flat-by-flat view with family and bills, use All flats in the sidebar."
    >
      <ResidentsTable rows={rows} />
    </InspectorSubpageLayout>
  );
}
