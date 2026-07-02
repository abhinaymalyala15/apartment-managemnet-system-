import { AdminUsersListWorkspace } from "@/components/admin/users/admin-users-list-workspace";
import { getStaffRoster } from "@/lib/settings-data";

export default function AdminUsersCommitteePage() {
  const committee = getStaffRoster().filter((s) => s.roleId === "committee_member");

  return (
    <AdminUsersListWorkspace
      title="Committee logins"
      description="Committee member portal access for oversight and approvals."
      members={committee}
      emptyLabel="No committee login accounts yet. Add from committee roster."
    />
  );
}
