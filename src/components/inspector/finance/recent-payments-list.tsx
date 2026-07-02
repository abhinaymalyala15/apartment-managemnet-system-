"use client";

import Link from "next/link";
import { useFinanceActions } from "@/components/inspector/finance/finance-provider";
import { formatCurrency, formatDate } from "@/lib/data";
import { routes } from "@/config/routes";
import type { EnrichedFinancePayment } from "@/types";
import { Button } from "@/components/ui/button";

interface RecentPaymentsListProps {
  payments: EnrichedFinancePayment[];
  showActions?: boolean;
}

export function RecentPaymentsList({
  payments,
  showActions = true,
}: RecentPaymentsListProps) {
  const { openAction } = useFinanceActions();

  if (payments.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        No payments recorded yet.
      </p>
    );
  }

  return (
    <ul className="surface-card divide-y">
      {payments.map((payment) => (
        <li
          key={payment.id}
          className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
        >
          <div>
            <p className="font-medium">
              Flat {payment.flatNumber} · {payment.period}
            </p>
            <p className="text-xs text-muted-foreground">
              {payment.residentName} · {payment.blockName}
              {payment.paidDate && ` · Paid ${formatDate(payment.paidDate)}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <p className="font-semibold tabular-nums">
              {formatCurrency(payment.amount)}
            </p>
            {showActions && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs"
                  onClick={() =>
                    openAction("print-receipt", {
                      flatNumber: payment.flatNumber,
                      receiptNumber: payment.receiptNumber,
                      paymentId: payment.id,
                    })
                  }
                >
                  Receipt
                </Button>
                <Link
                  href={routes.dashboard.inspector.flats.detail(payment.flatId)}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Open flat
                </Link>
              </>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
