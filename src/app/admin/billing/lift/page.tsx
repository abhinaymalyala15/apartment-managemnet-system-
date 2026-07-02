import { BillingFundConfig } from "@/components/admin/billing/billing-fund-config";

export default function AdminBillingLiftPage() {
  return (
    <BillingFundConfig
      title="Lift fund"
      description="Dedicated lift maintenance fund separate from general maintenance."
      rateLabel="Monthly levy"
      rateValue="₹150 / flat / month"
      cycleLabel="Billing cycle"
      cycleValue="Monthly · Day 1"
      notes="Covers AMC shortfall, emergency repairs, and modernization reserve."
    />
  );
}
