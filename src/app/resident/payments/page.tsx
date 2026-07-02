import { ResidentPageHeader } from "@/components/resident/resident-page-header";
import { ResidentContent } from "@/components/resident/resident-content";
import { ResidentStatusBanner } from "@/components/resident/resident-status-banner";
import { FilterablePaymentList } from "@/components/resident/filterable-payment-list";
import { ResidentSection } from "@/components/resident/resident-section";
import { ResidentHelpCard } from "@/components/resident/resident-help-card";
import {
  formatCurrency,
  getApartment,
  getCurrentYear,
  getMonthlyMaintenanceCharge,
  getPaidThisYearTotal,
} from "@/lib/data";
import { getResidentContext } from "@/lib/resident-context";
import { IndianRupee, CalendarCheck } from "lucide-react";

export default function ResidentPaymentsPage() {
  const apartment = getApartment();
  const { payments, flat } = getResidentContext();
  const monthlyCharge = getMonthlyMaintenanceCharge(flat);
  const year = getCurrentYear();
  const paidThisYear = getPaidThisYearTotal(payments);

  return (
    <>
      <ResidentPageHeader
        title="My bills"
        description="Monthly society charges, history, and receipts."
        showBack={false}
      />

      <ResidentContent>
        <ResidentStatusBanner payments={payments} />

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="surface-card bg-gradient-to-br from-success to-card p-4">
            <div className="flex items-center gap-2 text-success">
              <IndianRupee className="h-4 w-4" />
              <span className="text-sm font-medium">Monthly charge</span>
            </div>
            <p className="mt-2 text-2xl font-bold tabular-nums">
              {formatCurrency(monthlyCharge)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Due on the 5th of each month · ₹2 × {flat.areaSqft} sq.ft
            </p>
          </div>
          <div className="surface-card bg-gradient-to-br from-primary/10 to-card p-4">
            <div className="flex items-center gap-2 text-primary">
              <CalendarCheck className="h-4 w-4" />
              <span className="text-sm font-medium">Paid in {year}</span>
            </div>
            <p className="mt-2 text-2xl font-bold tabular-nums">
              {formatCurrency(paidThisYear)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {payments.filter((p) => p.status === "paid").length} bills cleared
            </p>
          </div>
        </div>

        <ResidentSection title="Payment history">
          <FilterablePaymentList payments={payments} />
        </ResidentSection>

        <ResidentHelpCard apartment={apartment} />
      </ResidentContent>
    </>
  );
}
