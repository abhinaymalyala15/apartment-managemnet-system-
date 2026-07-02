import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSectionNav } from "@/components/admin/admin-section-nav";
import { SettingsProvider } from "@/components/inspector/settings/settings-provider";
import { SettingsDrawers } from "@/components/inspector/settings/settings-drawers";
import { ADMIN_APARTMENT_SECTIONS } from "@/config/admin-workspace";

export default function AdminApartmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SettingsProvider>
      <div className="page-stack pb-8">
        <AdminPageHeader
          title="Apartment"
          description="Society profile, committee, emergency contacts, and bank details."
        />
        <AdminSectionNav
          items={ADMIN_APARTMENT_SECTIONS.map((s) => ({
            id: s.id,
            label: s.label,
            href: s.href,
          }))}
        />
        <div className="mt-2">{children}</div>
      </div>
      <SettingsDrawers />
    </SettingsProvider>
  );
}
