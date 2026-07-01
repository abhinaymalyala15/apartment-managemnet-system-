import Link from "next/link";
import { InspectorSubpageLayout } from "@/components/inspector/inspector-subpage-layout";
import { Badge } from "@/components/ui/badge";
import { FinancialSnapshot } from "@/components/dashboard/financial-snapshot";
import {
  getMaintenanceStats,
  getFlatById,
  formatCurrency,
  formatDate,
  getPaymentStatusVariant,
  getPaymentStatusLabel,
} from "@/lib/data";
import { CheckCircle2 } from "lucide-react";

export default function InspectorMaintenancePage() {
  const { summary, outstanding } = getMaintenanceStats();

  return (
    <InspectorSubpageLayout
      title="Unpaid bills"
      description="Maintenance payments that are still pending or overdue. Open a flat to see the full record including family details."
    >
      <FinancialSnapshot
        collected={summary.totalCollected}
        outstanding={summary.totalOutstanding}
        collectionRate={summary.collectionRate}
        month={summary.month}
      />

      {outstanding.length === 0 ? (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-5">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          <p className="text-sm font-medium text-emerald-900">
            All flats are up to date
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <div className="border-b bg-muted/30 px-5 py-3">
            <p className="text-sm font-medium">
              {outstanding.length} unpaid bill{outstanding.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="divide-y">
            {outstanding.map((payment) => {
              const flat = getFlatById(payment.flatId);
              return (
                <div
                  key={payment.id}
                  className="flex items-center justify-between gap-4 px-5 py-4"
                >
                  <div>
                    <Link
                      href={`/inspector/flats/${payment.flatId}`}
                      className="font-semibold text-primary hover:underline"
                    >
                      Flat {flat?.flatNumber ?? "—"}
                    </Link>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {payment.period} · due {formatDate(payment.dueDate)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold tabular-nums">
                      {formatCurrency(payment.amount)}
                    </p>
                    <Badge
                      variant={getPaymentStatusVariant(payment.status)}
                      className="mt-1 text-xs"
                    >
                      {getPaymentStatusLabel(payment.status)}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </InspectorSubpageLayout>
  );
}
