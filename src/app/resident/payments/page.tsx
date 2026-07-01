import { ResidentPageHeader } from "@/components/resident/resident-page-header";
import { ResidentContent } from "@/components/resident/resident-content";
import { ResidentStatusBanner } from "@/components/resident/resident-status-banner";
import { PaymentHistoryList } from "@/components/resident/payment-history-list";
import { ResidentSection } from "@/components/resident/resident-section";
import { ResidentHelpCard } from "@/components/resident/resident-help-card";
import { formatCurrency, getApartment } from "@/lib/data";
import { getResidentContext } from "@/lib/resident-context";
import { IndianRupee, CalendarCheck } from "lucide-react";

export default function ResidentPaymentsPage() {
  const apartment = getApartment();
  const { payments } = getResidentContext();

  const paidThisYear = payments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <>
      <ResidentPageHeader
        title="Maintenance bills"
        description="Your monthly society charges. View history and receipts here — online payment comes later."
        showBack={false}
      />

      <ResidentContent>
        <ResidentStatusBanner payments={payments} />

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border bg-gradient-to-br from-emerald-500/10 to-card p-4 shadow-sm">
            <div className="flex items-center gap-2 text-emerald-700">
              <IndianRupee className="h-4 w-4" />
              <span className="text-sm font-medium">Monthly charge</span>
            </div>
            <p className="mt-2 text-2xl font-bold">{formatCurrency(1300)}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Due on the 5th of each month
            </p>
          </div>
          <div className="rounded-2xl border bg-gradient-to-br from-primary/10 to-card p-4 shadow-sm">
            <div className="flex items-center gap-2 text-primary">
              <CalendarCheck className="h-4 w-4" />
              <span className="text-sm font-medium">Paid in 2025</span>
            </div>
            <p className="mt-2 text-2xl font-bold">
              {formatCurrency(paidThisYear)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {payments.filter((p) => p.status === "paid").length} bills cleared
            </p>
          </div>
        </div>

        <ResidentSection title="Bill history">
          <PaymentHistoryList payments={payments} />
        </ResidentSection>

        <ResidentHelpCard apartment={apartment} />
      </ResidentContent>
    </>
  );
}
