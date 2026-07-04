import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ServicesSetupProvider } from "@/components/admin/services/services-setup-provider";

export default function AdminServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ServicesSetupProvider>
      <div className="page-stack pb-8">
        <AdminPageHeader
          title="Services setup"
          description="Register assets, publish service info, edit schedules, and remove outdated entries."
        />
        <div className="mt-2">{children}</div>
      </div>
    </ServicesSetupProvider>
  );
}
