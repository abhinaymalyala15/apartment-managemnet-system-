import { ComplaintsWorkspace } from "@/components/inspector/complaints/complaints-workspace";
import { getComplaintRecords } from "@/lib/admin-data";

export default function OpenComplaintsPage() {
  return (
    <ComplaintsWorkspace
      items={getComplaintRecords("open")}
      emptyLabel="No open complaints"
    />
  );
}
