import { ComplaintsWorkspace } from "@/components/inspector/complaints/complaints-workspace";
import { getComplaintRecords } from "@/lib/admin-data";

export default function InProgressComplaintsPage() {
  return (
    <ComplaintsWorkspace
      items={getComplaintRecords("in_progress")}
      emptyLabel="No complaints in progress"
    />
  );
}
