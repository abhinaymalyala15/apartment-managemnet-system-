import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSettingsWorkspace } from "@/components/admin/settings/admin-settings-workspace";
import {
  getIntegrationRegistry,
  getRoleDefinitions,
  getSystemPreferences,
} from "@/lib/settings-data";

export default function AdminSettingsPage() {
  return (
    <div className="page-stack pb-8">
      <AdminPageHeader
        title="Settings"
        description="Theme, language, financial year, notifications, and integrations."
      />
      <AdminSettingsWorkspace
        preferences={getSystemPreferences()}
        integrations={getIntegrationRegistry()}
        roles={getRoleDefinitions()}
      />
    </div>
  );
}
