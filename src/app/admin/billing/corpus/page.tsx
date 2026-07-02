import { BillingFundConfig } from "@/components/admin/billing/billing-fund-config";

export default function AdminBillingCorpusPage() {
  return (
    <BillingFundConfig
      title="Corpus fund"
      description="One-time or periodic corpus fund contributions for major repairs and capital works."
      rateLabel="Contribution rate"
      rateValue="₹50 / sq.ft (one-time)"
      cycleLabel="Collection"
      cycleValue="On demand · AGM approved"
      notes="Last corpus collection was approved in AGM 2023 for lift modernization fund."
    />
  );
}
