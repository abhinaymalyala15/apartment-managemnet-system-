import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminResidentsWorkspace } from "@/components/admin/residents/admin-residents-workspace";
import { getFlatAssignmentRows } from "@/lib/admin-portal-data";

export default function AdminResidentsPage() {
  return (
    <div className="page-stack pb-8">
      <AdminPageHeader
        title="Residents"
        description="Assign owner, tenant, and family to flats. Master assignment only."
      />
      <AdminResidentsWorkspace rows={getFlatAssignmentRows()} />
    </div>
  );
}
