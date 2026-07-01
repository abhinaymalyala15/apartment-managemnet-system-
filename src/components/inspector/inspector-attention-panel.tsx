import Link from "next/link";
import {
  formatCurrency,
  formatDate,
  getFlatById,
  getPaymentStatusLabel,
} from "@/lib/data";
import type { Payment } from "@/types";
import { ArrowRight, CheckCircle2 } from "lucide-react";

interface InspectorAttentionPanelProps {
  outstanding: Payment[];
  totalOutstanding: number;
}

export function InspectorAttentionPanel({
  outstanding,
  totalOutstanding,
}: InspectorAttentionPanelProps) {
  if (outstanding.length === 0) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
        <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
        <p className="text-sm font-medium text-emerald-900">
          All maintenance bills are paid for this month.
        </p>
      </div>
    );
  }

  const preview = [...outstanding]
    .sort((a, b) => {
      if (a.status === "overdue" && b.status !== "overdue") return -1;
      if (b.status === "overdue" && a.status !== "overdue") return 1;
      return b.amount - a.amount;
    })
    .slice(0, 3);

  return (
    <div className="overflow-hidden rounded-xl border border-amber-200 bg-amber-50">
      <div className="border-b border-amber-200 px-4 py-3">
        <p className="font-medium text-amber-950">
          {outstanding.length} flats have not paid ·{" "}
          {formatCurrency(totalOutstanding)} owed
        </p>
      </div>

      <ul className="divide-y divide-amber-200/80 bg-card">
        {preview.map((payment) => {
          const flat = getFlatById(payment.flatId);
          return (
            <li key={payment.id}>
              <Link
                href={`/inspector/flats/${payment.flatId}`}
                className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-muted/40"
              >
                <div>
                  <p className="font-medium">Flat {flat?.flatNumber ?? "—"}</p>
                  <p className="text-sm text-muted-foreground">
                    {getPaymentStatusLabel(payment.status)} · due{" "}
                    {formatDate(payment.dueDate)}
                  </p>
                </div>
                <p className="font-semibold tabular-nums">
                  {formatCurrency(payment.amount)}
                </p>
              </Link>
            </li>
          );
        })}
      </ul>

      <Link
        href="/inspector/maintenance"
        className="flex items-center justify-between px-4 py-3 text-sm font-medium text-amber-950 hover:bg-amber-100/80"
      >
        See all unpaid bills
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
