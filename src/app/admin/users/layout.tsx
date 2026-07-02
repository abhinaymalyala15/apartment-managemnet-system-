import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSectionNav } from "@/components/admin/admin-section-nav";
import { ADMIN_USER_SECTIONS } from "@/config/admin-workspace";

export default function AdminUsersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="page-stack pb-8">
      <AdminPageHeader
        title="Users"
        description="Create accounts, assign roles, reset passwords, and deactivate access."
      />
      <AdminSectionNav
        items={ADMIN_USER_SECTIONS.map((s) => ({
          id: s.id,
          label: s.label,
          href: s.href,
        }))}
      />
      <div className="mt-2">{children}</div>
    </div>
  );
}
