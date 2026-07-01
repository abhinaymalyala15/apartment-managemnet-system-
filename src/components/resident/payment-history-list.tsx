import { CheckCircle2, Clock, AlertCircle, Receipt } from "lucide-react";
import {
  formatCurrency,
  formatDate,
  getPaymentStatusLabel,
} from "@/lib/data";
import type { Payment } from "@/types";
import { cn } from "@/lib/utils";

interface PaymentHistoryListProps {
  payments: Payment[];
}

const statusConfig = {
  paid: {
    Icon: CheckCircle2,
    stripe: "bg-emerald-500",
    badge: "bg-emerald-50 text-emerald-700",
  },
  pending: {
    Icon: Clock,
    stripe: "bg-amber-500",
    badge: "bg-amber-50 text-amber-700",
  },
  overdue: {
    Icon: AlertCircle,
    stripe: "bg-red-500",
    badge: "bg-red-50 text-red-700",
  },
};

export function PaymentHistoryList({ payments }: PaymentHistoryListProps) {
  return (
    <div className="space-y-3">
      {payments.map((payment) => {
        const config = statusConfig[payment.status];
        const { Icon } = config;

        return (
          <div
            key={payment.id}
            className="overflow-hidden rounded-2xl border bg-card shadow-sm"
          >
            <div className="flex">
              <div className={cn("w-1 shrink-0", config.stripe)} />
              <div className="flex flex-1 items-start justify-between gap-3 p-4">
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                      config.badge
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">{payment.period}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {payment.status === "paid" && payment.paidDate
                        ? `Paid ${formatDate(payment.paidDate)}`
                        : `Due ${formatDate(payment.dueDate)}`}
                    </p>
                    {payment.receiptNumber && (
                      <p className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
                        <Receipt className="h-3 w-3" />
                        {payment.receiptNumber}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold">
                    {formatCurrency(payment.amount)}
                  </p>
                  <p className="text-xs font-medium text-muted-foreground">
                    {getPaymentStatusLabel(payment.status)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
