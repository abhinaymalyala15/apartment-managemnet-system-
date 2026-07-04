import { SettingsProvider } from "@/components/inspector/settings/settings-provider";
import { SettingsDrawers } from "@/components/inspector/settings/settings-drawers";
import { MaintenanceConfigWorkspace } from "@/components/inspector/settings/maintenance-config-workspace";
import { BillingFundConfig } from "@/components/admin/billing/billing-fund-config";
import {
  getComputedMaintenancePreview,
  getMaintenanceBillingConfig,
} from "@/lib/settings-data";

export default function AdminBillingRulesPage() {
  const config = getMaintenanceBillingConfig();

  return (
    <SettingsProvider>
      <div className="space-y-8">
        <MaintenanceConfigWorkspace
          config={config}
          preview={getComputedMaintenancePreview()}
        />
        <BillingFundConfig
          title="Late fee & penalty"
          description="Rules applied when maintenance or fund payments are overdue."
          rateLabel="Late fee"
          rateValue={`${config.lateFeePercent}% after grace period`}
          cycleLabel="Grace period"
          cycleValue={`${config.lateFeeGraceDays} days from due date`}
          notes="Default maintenance rate here feeds the bulk “Apply to all flats” action on Flat billing."
        />
      </div>
      <SettingsDrawers />
    </SettingsProvider>
  );
}
