import Link from "next/link";
import { formatCurrency } from "@/lib/data";
import { ArrowRight } from "lucide-react";

interface InspectorBillingPanelProps {
  month: string;
  collected: number;
  outstanding: number;
  collectionRate: number;
}

export function InspectorBillingPanel({
  month,
  collected,
  outstanding,
  collectionRate,
}: InspectorBillingPanelProps) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <p className="text-sm text-muted-foreground">{month} maintenance</p>

      <div className="mt-4 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-lg bg-muted/50 px-2 py-3">
          <p className="text-lg font-semibold tabular-nums text-emerald-700">
            {formatCurrency(collected)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Received</p>
        </div>
        <div className="rounded-lg bg-muted/50 px-2 py-3">
          <p className="text-lg font-semibold tabular-nums text-amber-700">
            {formatCurrency(outstanding)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Still owed</p>
        </div>
        <div className="rounded-lg bg-muted/50 px-2 py-3">
          <p className="text-lg font-semibold tabular-nums">{collectionRate}%</p>
          <p className="mt-1 text-xs text-muted-foreground">Collected</p>
        </div>
      </div>

      <div className="mt-4">
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${Math.min(collectionRate, 100)}%` }}
          />
        </div>
      </div>

      <Link
        href="/inspector/reports"
        className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
      >
        Full billing report
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
