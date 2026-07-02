import { BillingFundConfig } from "@/components/admin/billing/billing-fund-config";
import { getMaintenanceBillingConfig } from "@/lib/settings-data";

export default function AdminBillingPenaltyPage() {
  const config = getMaintenanceBillingConfig();

  return (
    <BillingFundConfig
      title="Late fee & penalty"
      description="Rules applied when maintenance or fund payments are overdue."
      rateLabel="Late fee"
      rateValue={`${config.lateFeePercent}% after grace period`}
      cycleLabel="Grace period"
      cycleValue={`${config.lateFeeGraceDays} days from due date`}
      notes="GST on late fees follows society GST configuration. Inspectors apply penalties during collection."
    />
  );
}
