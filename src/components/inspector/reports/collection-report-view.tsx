import { StatCard } from "@/components/dashboard/stat-card";
import { PaymentTrendChart } from "@/components/inspector/finance/payment-trend-chart";
import { formatCurrency } from "@/lib/data";
import type { CollectionReportData } from "@/types";
import { TrendingUp, Wallet } from "lucide-react";

interface CollectionReportViewProps {
  data: CollectionReportData;
}

export function CollectionReportView({ data }: CollectionReportViewProps) {
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Showing collection data for <span className="font-medium text-foreground">{data.context.label}</span>
      </p>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          title="Collection rate"
          value={`${data.collectionRate}%`}
          description={data.billingMonth}
          icon={TrendingUp}
          className="p-4"
        />
        <StatCard
          title="Collected"
          value={formatCurrency(data.totalCollected)}
          description="In this block"
          icon={Wallet}
          className="p-4"
        />
        <StatCard
          title="Outstanding"
          value={formatCurrency(data.totalOutstanding)}
          description="Pending + overdue"
          icon={Wallet}
          className={
            data.totalOutstanding > 0 ? "border-amber-500/30 p-4" : "p-4"
          }
        />
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Collection trend
        </h2>
        <PaymentTrendChart data={data.paymentTrend} />
      </div>
    </div>
  );
}
