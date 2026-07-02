import { StatCard } from "@/components/dashboard/stat-card";
import { PaymentTrendChart } from "@/components/inspector/finance/payment-trend-chart";
import { formatCurrency } from "@/lib/data";
import type { CollectionReportData } from "@/types";
import { TrendingUp, Wallet } from "lucide-react";

interface FinancialReportViewProps {
  data: CollectionReportData;
}

export function FinancialReportView({ data }: FinancialReportViewProps) {
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Showing financial summary for{" "}
        <span className="font-medium text-foreground">{data.context.label}</span>
      </p>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          title="Collected"
          value={formatCurrency(data.totalCollected)}
          description={data.billingMonth}
          icon={Wallet}
          className="p-4"
        />
        <StatCard
          title="Outstanding"
          value={formatCurrency(data.totalOutstanding)}
          description="Open amount"
          icon={Wallet}
          className="p-4"
        />
        <StatCard
          title="Collection rate"
          value={`${data.collectionRate}%`}
          description="Current cycle"
          icon={TrendingUp}
          className="p-4"
        />
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Financial trend
        </h2>
        <PaymentTrendChart data={data.paymentTrend} />
      </div>
    </div>
  );
}
