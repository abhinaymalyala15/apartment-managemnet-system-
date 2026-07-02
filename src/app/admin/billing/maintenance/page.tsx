import { SettingsProvider } from "@/components/inspector/settings/settings-provider";
import { SettingsDrawers } from "@/components/inspector/settings/settings-drawers";
import { MaintenanceConfigWorkspace } from "@/components/inspector/settings/maintenance-config-workspace";
import {
  getComputedMaintenancePreview,
  getMaintenanceBillingConfig,
} from "@/lib/settings-data";

export default function AdminBillingMaintenancePage() {
  return (
    <SettingsProvider>
      <MaintenanceConfigWorkspace
        config={getMaintenanceBillingConfig()}
        preview={getComputedMaintenancePreview()}
      />
      <SettingsDrawers />
    </SettingsProvider>
  );
}
