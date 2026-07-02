import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSectionNav } from "@/components/admin/admin-section-nav";
import { ADMIN_SERVICE_SECTIONS } from "@/config/admin-workspace";

export default function AdminServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="page-stack pb-8">
      <AdminPageHeader
        title="Services setup"
        description="Configure assets, vendors, AMC, and service schedules. Inspectors mark completion."
      />
      <AdminSectionNav
        items={ADMIN_SERVICE_SECTIONS.map((s) => ({
          id: s.id,
          label: s.label,
          href: s.href,
        }))}
      />
      <div className="mt-2">{children}</div>
    </div>
  );
}
