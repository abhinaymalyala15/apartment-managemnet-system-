import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSectionNav } from "@/components/admin/admin-section-nav";
import { ADMIN_BILLING_MODULES } from "@/config/admin-workspace";

export default function AdminBillingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="page-stack pb-8">
      <AdminPageHeader
        title="Billing setup"
        description="Configure rates, funds, and penalty rules. Inspectors record collections."
      />
      <AdminSectionNav
        items={ADMIN_BILLING_MODULES.map((s) => ({
          id: s.id,
          label: s.label,
          href: s.href,
        }))}
      />
      <div className="mt-2">{children}</div>
    </div>
  );
}
