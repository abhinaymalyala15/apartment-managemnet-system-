"use client";

import { Button } from "@/components/ui/button";
import { useFinanceActions } from "@/components/inspector/finance/finance-provider";
import { FileText } from "lucide-react";

export function StatementsWorkspace() {
  const { openAction } = useFinanceActions();

  const scopes = [
    {
      title: "Flat statement",
      description: "Single household — outstanding, payments, receipts for one flat.",
      action: () => openAction("generate-statement", { flatId: "flat-101", flatNumber: "101" }),
    },
    {
      title: "Block statement",
      description: "All flats in one block — collection rate and overdue summary.",
      action: () => openAction("generate-statement"),
    },
    {
      title: "Community statement",
      description: "Whole apartment financial overview for a date range.",
      action: () => openAction("generate-statement"),
    },
  ];

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Generate printable statements for flat, block, or the entire apartment.
        Flat-level detail always links to the Flat Operations Hub for full history.
      </p>

      <div className="grid gap-4 sm:grid-cols-3">
        {scopes.map((scope) => (
          <article key={scope.title} className="surface-card flex flex-col p-5">
            <FileText className="h-8 w-8 text-primary" />
            <h3 className="mt-3 font-semibold">{scope.title}</h3>
            <p className="mt-1 flex-1 text-sm text-muted-foreground">
              {scope.description}
            </p>
            <Button className="mt-4 w-full" variant="outline" onClick={scope.action}>
              Generate
            </Button>
          </article>
        ))}
      </div>

      <div className="rounded-xl border border-dashed bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
        Date range, print, and download are configured in the statement drawer.
        Exported statements will integrate with the Reports module in a later phase.
      </div>
    </div>
  );
}
