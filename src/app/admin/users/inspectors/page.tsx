import { AdminUsersListWorkspace } from "@/components/admin/users/admin-users-list-workspace";
import { getStaffRoster } from "@/lib/settings-data";

export default function AdminUsersInspectorsPage() {
  const inspectors = getStaffRoster().filter(
    (s) => s.roleId === "inspector" || s.roleId === "office_manager"
  );

  return (
    <AdminUsersListWorkspace
      title="Inspectors"
      description="Apartment inspector accounts with full operational portal access."
      members={inspectors}
      emptyLabel="No inspector accounts configured."
    />
  );
}
