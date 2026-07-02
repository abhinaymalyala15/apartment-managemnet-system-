import { BillingFundConfig } from "@/components/admin/billing/billing-fund-config";

export default function AdminBillingSpecialPage() {
  return (
    <BillingFundConfig
      title="Special assessment"
      description="One-time charges for specific projects — facade repair, fire safety upgrade, etc."
      rateLabel="Active assessment"
      rateValue="None active"
      cycleLabel="Approval"
      cycleValue="General body resolution required"
      notes="Create a special assessment when the committee approves a capital project."
    />
  );
}
