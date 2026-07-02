"use client";

import { useMemo, useState } from "react";
import { ListToolbar } from "@/components/ui/list-toolbar";
import { RecentPaymentsList } from "@/components/inspector/finance/recent-payments-list";
import { getFinancePaymentHistory, getFinancePaymentsWindow } from "@/lib/finance-data";

type PeriodFilter = "all" | "week" | "month" | "history";

const PERIOD_OPTIONS = [
  { value: "all", label: "All" },
  { value: "week", label: "This week" },
  { value: "month", label: "This month" },
  { value: "history", label: "History" },
] as const;

function getPaymentsForPeriod(period: PeriodFilter) {
  if (period === "all" || period === "history") {
    return getFinancePaymentHistory();
  }
  return getFinancePaymentsWindow(period);
}

export function PaymentsWorkspace() {
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("all");
  const [search, setSearch] = useState("");

  const periodBase = useMemo(
    () => getPaymentsForPeriod(periodFilter),
    [periodFilter]
  );

  const payments = useMemo(() => {
    let list = periodBase;

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.flatNumber.includes(q) ||
          p.residentName.toLowerCase().includes(q) ||
          p.period.toLowerCase().includes(q) ||
          p.receiptNumber?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [periodBase, search]);

  return (
    <div className="space-y-4">
      <ListToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search flat, resident, period, receipt…"
        filters={[
          {
            id: "period",
            value: periodFilter,
            onChange: (v) => setPeriodFilter(v as PeriodFilter),
            placeholder: "Period",
            options: [...PERIOD_OPTIONS],
          },
        ]}
        resultCount={{ shown: payments.length, total: periodBase.length }}
      />

      <RecentPaymentsList payments={payments} />
    </div>
  );
}
