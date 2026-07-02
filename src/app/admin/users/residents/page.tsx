import { AdminUsersListWorkspace } from "@/components/admin/users/admin-users-list-workspace";
import { getFlatByIdOrThrow } from "@/lib/admin-portal-data";
import ownersData from "@/data/owners.json";
import type { Owner } from "@/types";

export default function AdminUsersResidentsPage() {
  const owners = ownersData as Owner[];
  const residents = owners.slice(0, 12).map((owner) => {
    const flat = getFlatByIdOrThrow(owner.flatId);
    return {
      id: owner.id,
      fullName: owner.fullName,
      roleId: "resident",
      phone: owner.phone,
      email: owner.email,
      department: `Flat ${flat.flatNumber}`,
      blockIds: [] as string[],
      isActive: true,
      joinedAt: owner.ownershipStartDate,
      roleLabel: "Resident",
      blockLabels: "—",
    };
  });

  return (
    <AdminUsersListWorkspace
      title="Resident logins"
      description="Resident app access — invite, reset password, deactivate."
      members={residents}
    />
  );
}
