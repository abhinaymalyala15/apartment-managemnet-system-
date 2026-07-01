import { formatCurrency } from "@/lib/data";
import { TrendingUp, AlertCircle, Wallet } from "lucide-react";

interface FinancialSnapshotProps {
  collected: number;
  outstanding: number;
  collectionRate: number;
  month: string;
}

export function FinancialSnapshot({
  collected,
  outstanding,
  collectionRate,
  month,
}: FinancialSnapshotProps) {
  const items = [
    {
      label: "Collected",
      value: formatCurrency(collected),
      sub: month,
      icon: Wallet,
      accent: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Outstanding",
      value: formatCurrency(outstanding),
      sub: "Pending & overdue",
      icon: AlertCircle,
      accent: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/10",
    },
    {
      label: "Collection Rate",
      value: `${collectionRate}%`,
      sub: "This billing cycle",
      icon: TrendingUp,
      accent: "text-primary",
      bg: "bg-primary/10",
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-sm"
        >
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${item.bg}`}
          >
            <item.icon className={`h-5 w-5 ${item.accent}`} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground">
              {item.label}
            </p>
            <p className="text-lg font-semibold tracking-tight">{item.value}</p>
            <p className="text-xs text-muted-foreground">{item.sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
