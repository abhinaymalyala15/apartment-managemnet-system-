"use client";

import { useMemo, useState } from "react";
import { Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ListToolbar } from "@/components/ui/list-toolbar";
import { EmptyState } from "@/components/ui/empty-state";
import { PaymentHistoryList } from "@/components/resident/payment-history-list";
import {
  formatCurrency,
  getPaymentTypeLabel,
} from "@/lib/data";
import type { Payment } from "@/types";
import { IndianRupee } from "lucide-react";

interface FilterablePaymentListProps {
  payments: Payment[];
}

type StatusFilter = "all" | Payment["status"];
type SortKey = "newest" | "oldest" | "amount-high" | "amount-low";

export function FilterablePaymentList({ payments }: FilterablePaymentListProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sort, setSort] = useState<SortKey>("newest");

  const filtered = useMemo(() => {
    let list = [...payments];

    if (statusFilter !== "all") {
      list = list.filter((p) => p.status === statusFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.period.toLowerCase().includes(q) ||
          p.receiptNumber?.toLowerCase().includes(q) ||
          getPaymentTypeLabel(p.type).toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      switch (sort) {
        case "oldest":
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case "amount-high":
          return b.amount - a.amount;
        case "amount-low":
          return a.amount - b.amount;
        default:
          return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
      }
    });

    return list;
  }, [payments, search, statusFilter, sort]);

  function handlePrint() {
    window.print();
  }

  function handleDownloadReceipt(payment: Payment) {
    const text = [
      "Sylvan Shelter Apartment — Maintenance Receipt",
      "",
      `Period: ${payment.period}`,
      `Amount: ${formatCurrency(payment.amount)}`,
      `Type: ${getPaymentTypeLabel(payment.type)}`,
      `Status: ${payment.status}`,
      payment.receiptNumber ? `Receipt: ${payment.receiptNumber}` : "",
      payment.paidDate ? `Paid on: ${payment.paidDate}` : `Due: ${payment.dueDate}`,
    ]
      .filter(Boolean)
      .join("\n");

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `receipt-${payment.receiptNumber ?? payment.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-end gap-2 print:hidden">
        <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5">
          <Printer className="h-4 w-4" />
          Print history
        </Button>
      </div>

      <div className="print:hidden">
        <ListToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search period, receipt, or type…"
          filters={[
            {
              id: "status",
              value: statusFilter,
              onChange: (v) => setStatusFilter(v as StatusFilter),
              placeholder: "Status",
              options: [
                { value: "all", label: "All status" },
                { value: "paid", label: "Paid" },
                { value: "pending", label: "Pending" },
                { value: "overdue", label: "Overdue" },
              ],
            },
          ]}
          sort={{
            id: "sort",
            value: sort,
            onChange: (v) => setSort(v as SortKey),
            placeholder: "Sort",
            options: [
              { value: "newest", label: "Newest first" },
              { value: "oldest", label: "Oldest first" },
              { value: "amount-high", label: "Amount high–low" },
              { value: "amount-low", label: "Amount low–high" },
            ],
          }}
          resultCount={{ shown: filtered.length, total: payments.length }}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={IndianRupee}
          title="No bills match"
          description="Try adjusting your search or filters."
        />
      ) : (
        <PaymentHistoryList
          payments={filtered}
          onDownloadReceipt={handleDownloadReceipt}
        />
      )}
    </div>
  );
}
