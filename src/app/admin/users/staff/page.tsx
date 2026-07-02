import { AdminUsersListWorkspace } from "@/components/admin/users/admin-users-list-workspace";
import { getStaffRoster } from "@/lib/settings-data";

export default function AdminUsersStaffPage() {
  const staff = getStaffRoster().filter(
    (s) => s.roleId === "office_manager" || s.roleId === "accountant"
  );

  return (
    <AdminUsersListWorkspace
      title="Office staff"
      description="Office manager, accountant, and administrative staff."
      members={staff}
    />
  );
}
