import { ComplaintsWorkspace } from "@/components/inspector/complaints/complaints-workspace";
import { getComplaintRecords } from "@/lib/admin-data";

export default function ResolvedComplaintsPage() {
  return (
    <ComplaintsWorkspace
      items={getComplaintRecords("resolved")}
      emptyLabel="No resolved complaints"
    />
  );
}
