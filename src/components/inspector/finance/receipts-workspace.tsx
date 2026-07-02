"use client";

import { useMemo, useState } from "react";
import { ListToolbar } from "@/components/ui/list-toolbar";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { useFinanceActions } from "@/components/inspector/finance/finance-provider";
import { getFinanceReceipts } from "@/lib/finance-data";
import { formatCurrency, formatDate } from "@/lib/data";
import { routes } from "@/config/routes";
import Link from "next/link";
import { Receipt } from "lucide-react";

export function ReceiptsWorkspace() {
  const { openAction } = useFinanceActions();
  const [search, setSearch] = useState("");
  const allReceipts = getFinanceReceipts();

  const filtered = useMemo(() => {
    if (!search.trim()) return allReceipts;
    const q = search.toLowerCase();
    return allReceipts.filter(
      (r) =>
        r.flatNumber.includes(q) ||
        r.residentName.toLowerCase().includes(q) ||
        r.receiptNumber?.toLowerCase().includes(q) ||
        r.period.toLowerCase().includes(q)
    );
  }, [allReceipts, search]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          onClick={() => openAction("generate-receipt")}
        >
          Generate receipt
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => openAction("record-payment")}
        >
          Record payment first
        </Button>
      </div>

      <ListToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search receipt, flat, period…"
        resultCount={{ shown: filtered.length, total: allReceipts.length }}
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No receipts found"
          description="Receipts are generated when payments are recorded."
        />
      ) : (
        <ul className="surface-card divide-y">
          {filtered.map((receipt) => (
            <li
              key={receipt.id}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
            >
              <div>
                <p className="font-medium">{receipt.receiptNumber}</p>
                <p className="text-sm text-muted-foreground">
                  Flat {receipt.flatNumber} · {receipt.period} ·{" "}
                  {receipt.paidDate && formatDate(receipt.paidDate)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <p className="font-semibold tabular-nums">
                  {formatCurrency(receipt.amount)}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs"
                  onClick={() =>
                    openAction("print-receipt", {
                      flatNumber: receipt.flatNumber,
                      receiptNumber: receipt.receiptNumber,
                      paymentId: receipt.id,
                    })
                  }
                >
                  Print
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs"
                  onClick={() =>
                    openAction("download-receipt", {
                      flatNumber: receipt.flatNumber,
                      receiptNumber: receipt.receiptNumber,
                      paymentId: receipt.id,
                    })
                  }
                >
                  Download
                </Button>
                <Link
                  href={routes.dashboard.inspector.flats.detail(receipt.flatId)}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Open flat
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
