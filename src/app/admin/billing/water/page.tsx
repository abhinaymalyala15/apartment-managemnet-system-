import { BillingFundConfig } from "@/components/admin/billing/billing-fund-config";

export default function AdminBillingWaterPage() {
  return (
    <BillingFundConfig
      title="Water charges"
      description="Water fund billing — tanker backup, treatment, and shared consumption."
      rateLabel="Flat rate"
      rateValue="₹350 / flat / month"
      cycleLabel="Billing cycle"
      cycleValue="Monthly · with maintenance"
      notes="Includes overhead tank cleaning allocation. Metered flats use a separate slab (future)."
    />
  );
}
