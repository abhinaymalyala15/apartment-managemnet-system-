import { AdminRolesWorkspace } from "@/components/admin/users/admin-roles-workspace";
import { getRoleDefinitions } from "@/lib/settings-data";

export default function AdminUsersRolesPage() {
  return <AdminRolesWorkspace roles={getRoleDefinitions()} />;
}
