import { AdminUsersListWorkspace } from "@/components/admin/users/admin-users-list-workspace";
import { getStaffRoster } from "@/lib/settings-data";

export default function AdminUsersSecurityPage() {
  const security = getStaffRoster().filter((s) => s.roleId === "security_supervisor");

  return (
    <AdminUsersListWorkspace
      title="Security"
      description="Security supervisor accounts for gate and visitor coordination."
      members={security}
    />
  );
}
