import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminFlatsWorkspace } from "@/components/admin/flats/admin-flats-workspace";
import {
  getAdminBlockSummaries,
  getFlatAssignmentRows,
} from "@/lib/admin-portal-data";

export default function AdminFlatsPage() {
  return (
    <div className="page-stack pb-8">
      <AdminPageHeader
        title="Flats"
        description="Auto-generate flat numbers and configure flat attributes."
      />
      <AdminFlatsWorkspace
        blocks={getAdminBlockSummaries()}
        assignments={getFlatAssignmentRows()}
      />
    </div>
  );
}
