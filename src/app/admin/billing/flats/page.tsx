import { BillingSetupProvider } from "@/components/admin/billing/billing-setup-provider";
import { AdminFlatBillingWorkspace } from "@/components/admin/billing/admin-flat-billing-workspace";
import {
  getBillingSetupConfig,
  getFlatBillingRows,
} from "@/lib/billing-setup-data";

export default function AdminBillingFlatsPage() {
  const config = getBillingSetupConfig();
  const rows = getFlatBillingRows();

  return (
    <BillingSetupProvider initialConfig={config} initialRows={rows}>
      <AdminFlatBillingWorkspace />
    </BillingSetupProvider>
  );
}
