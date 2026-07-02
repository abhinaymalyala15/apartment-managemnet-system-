"use client";

import { CheckCircle2, Clock, AlertCircle, Receipt, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  formatCurrency,
  formatDate,
  getPaymentStatusLabel,
  getPaymentTypeLabel,
} from "@/lib/data";
import type { Payment } from "@/types";
import { cn } from "@/lib/utils";

interface PaymentHistoryListProps {
  payments: Payment[];
  onDownloadReceipt?: (payment: Payment) => void;
}

const statusConfig = {
  paid: {
    Icon: CheckCircle2,
    stripe: "bg-success",
    badge: "bg-success text-success",
  },
  pending: {
    Icon: Clock,
    stripe: "bg-warning",
    badge: "bg-warning text-warning-foreground",
  },
  overdue: {
    Icon: AlertCircle,
    stripe: "bg-destructive",
    badge: "bg-destructive/10 text-destructive",
  },
};

export function PaymentHistoryList({
  payments,
  onDownloadReceipt,
}: PaymentHistoryListProps) {
  return (
    <div className="space-y-3">
      {payments.map((payment) => {
        const config = statusConfig[payment.status];
        const { Icon } = config;

        return (
          <div key={payment.id} className="surface-card overflow-hidden">
            <div className="flex">
              <div className={cn("w-1 shrink-0", config.stripe)} />
              <div className="flex flex-1 flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
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
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{payment.period}</p>
                      <Badge variant="outline" className="text-[10px]">
                        {getPaymentTypeLabel(payment.type)}
                      </Badge>
                    </div>
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
                <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                  <div className="text-right">
                    <p className="text-lg font-semibold tabular-nums">
                      {formatCurrency(payment.amount)}
                    </p>
                    <p className="text-xs font-medium text-muted-foreground">
                      {getPaymentStatusLabel(payment.status)}
                    </p>
                  </div>
                  {payment.status === "paid" && onDownloadReceipt && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 print:hidden"
                      onClick={() => onDownloadReceipt(payment)}
                    >
                      <Download className="h-3.5 w-3.5" />
                      Receipt
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
