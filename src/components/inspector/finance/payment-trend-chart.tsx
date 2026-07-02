import type { FinancePaymentTrendPoint } from "@/types";
import { formatCurrency } from "@/lib/data";
import { cn } from "@/lib/utils";

interface PaymentTrendChartProps {
  data: FinancePaymentTrendPoint[];
}

export function PaymentTrendChart({ data }: PaymentTrendChartProps) {
  if (data.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No trend data available.
      </p>
    );
  }

  const maxCollected = Math.max(...data.map((d) => d.collected), 1);

  return (
    <div className="surface-card p-4 sm:p-5">
      <div className="flex items-end justify-between gap-2 sm:gap-4">
        {data.map((point) => {
          const height = Math.max(8, (point.collected / maxCollected) * 120);
          const rateGood = point.collectionRate >= 90;
          return (
            <div
              key={point.monthKey}
              className="flex min-w-0 flex-1 flex-col items-center gap-2"
            >
              <span className="text-[10px] font-medium tabular-nums text-muted-foreground sm:text-xs">
                {point.collectionRate}%
              </span>
              <div
                className={cn(
                  "w-full max-w-12 rounded-t-md transition-all",
                  rateGood ? "bg-emerald-500/80" : "bg-amber-500/80"
                )}
                style={{ height }}
                title={`${point.month}: ${formatCurrency(point.collected)} collected`}
              />
              <span className="truncate text-center text-[10px] text-muted-foreground sm:text-xs">
                {point.month.split(" ")[0].slice(0, 3)}
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap gap-4 border-t pt-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm bg-emerald-500/80" />
          ≥90% collection
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm bg-amber-500/80" />
          Below 90%
        </span>
      </div>
    </div>
  );
}
