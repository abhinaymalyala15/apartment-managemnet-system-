import { CheckCircle2, AlertCircle } from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import { formatCurrency, formatDate } from "@/lib/data";
import type { Payment } from "@/types";
import { cn } from "@/lib/utils";

interface ResidentStatusBannerProps {
  payments: Payment[];
}

export function ResidentStatusBanner({ payments }: ResidentStatusBannerProps) {
  const overdue = payments.find((p) => p.status === "overdue");
  const pending = payments.find((p) => p.status === "pending");
  const due = overdue ?? pending;
  const lastPaid = payments.find((p) => p.status === "paid");

  if (due) {
    const isOverdue = Boolean(overdue);
    return (
      <div
        className={cn(
          "overflow-hidden rounded-2xl border shadow-sm",
          isOverdue
            ? "border-red-200 bg-gradient-to-r from-red-50 to-card dark:border-red-900/40 dark:from-red-950/40"
            : "border-amber-200 bg-gradient-to-r from-amber-50 to-card dark:border-amber-900/40 dark:from-amber-950/40"
        )}
      >
        <div className="flex items-stretch">
          <div
            className={cn(
              "flex w-1.5 shrink-0",
              isOverdue ? "bg-red-500" : "bg-amber-500"
            )}
          />
          <div className="flex flex-1 flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                  isOverdue ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"
                )}
              >
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">
                  {isOverdue ? "Overdue bill" : "Bill due soon"}
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {due.period} · pay by {formatDate(due.dueDate)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 sm:flex-col sm:items-end">
              <p className="text-2xl font-bold">{formatCurrency(due.amount)}</p>
              <ButtonLink href="/resident/payments" size="sm">
                View bill
              </ButtonLink>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-card shadow-sm dark:border-emerald-900/40 dark:from-emerald-950/40">
      <div className="flex items-stretch">
        <div className="w-1.5 shrink-0 bg-emerald-500" />
        <div className="flex flex-1 flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold">All bills paid</p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                You&apos;re up to date.
                {lastPaid?.paidDate && (
                  <> Last payment {formatDate(lastPaid.paidDate)}.</>
                )}
              </p>
            </div>
          </div>
          <ButtonLink href="/resident/payments" variant="outline" size="sm">
            View history
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
