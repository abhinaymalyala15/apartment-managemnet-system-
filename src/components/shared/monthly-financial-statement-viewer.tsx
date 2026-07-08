"use client";

import { useEffect, useState } from "react";
import { Eye, FileSpreadsheet, Printer, X } from "lucide-react";
import { StatementLineTable } from "@/components/admin/financial-statements/statement-line-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/data";
import {
  listPublishedFinancialStatements,
  statementKindLabel,
  sumStatementLines,
} from "@/lib/financial-statement-data";
import type { FinancialStatement } from "@/types/financial-statement";
import { cn } from "@/lib/utils";

interface MonthlyFinancialStatementViewerProps {
  portalLabel: string;
  className?: string;
}

export function MonthlyFinancialStatementViewer({
  portalLabel,
  className,
}: MonthlyFinancialStatementViewerProps) {
  const [statements, setStatements] = useState<FinancialStatement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const published = listPublishedFinancialStatements();
    setStatements(published);
    setSelectedId(published[0]?.id ?? null);
    setHydrated(true);
  }, []);

  const selected = statements.find((s) => s.id === selectedId) ?? statements[0];
  const totals = selected ? sumStatementLines(selected.lines) : null;

  const openPreview = (id: string) => {
    setSelectedId(id);
    setPreviewOpen(true);
  };

  return (
    <div className={cn("page-stack", className)}>
      <header className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white px-5 py-5 shadow-[0_4px_20px_rgb(0,0,0,0.04)] sm:px-6">
        <div className="absolute inset-y-0 left-0 w-1.5 bg-primary" />
        <div className="flex flex-wrap items-end justify-between gap-4 pl-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
              {portalLabel}
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
              Balance Sheet
            </h1>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-600">
              Published monthly balance sheets from Apartment Admin. View and print only —
              editing is not available here.
            </p>
          </div>
          {selected && (
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={() => setPreviewOpen(true)}>
                <Eye className="h-4 w-4" />
                Preview
              </Button>
              <Button type="button" variant="outline" onClick={() => window.print()}>
                <Printer className="h-4 w-4" />
                Print
              </Button>
            </div>
          )}
        </div>
      </header>

      {!hydrated ? (
        <div className="surface-card p-8 text-sm text-slate-500">Loading balance sheets…</div>
      ) : statements.length === 0 ? (
        <div className="surface-card-muted p-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-200/80 text-slate-600">
            <FileSpreadsheet className="h-5 w-5" />
          </div>
          <p className="text-base font-semibold text-slate-800">No balance sheet published yet</p>
          <p className="mt-1 text-sm text-slate-600">
            When Admin publishes a monthly statement, a small month option will appear here
            (for example: “Balance sheet of July 2026”) with Preview.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Compact month options */}
          <section className="admin-panel overflow-hidden">
            <div className="border-b bg-slate-50 px-4 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
              Available months
            </div>
            <div className="flex flex-wrap gap-2.5 p-4">
              {statements.map((s) => {
                const isActive = selected?.id === s.id;
                return (
                  <div
                    key={s.id}
                    className={cn(
                      "inline-flex max-w-full items-center gap-1 rounded-full border p-1 pl-3 shadow-sm transition-colors",
                      isActive
                        ? "border-primary/30 bg-primary/10"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedId(s.id)}
                      className={cn(
                        "min-w-0 text-left text-sm font-semibold",
                        isActive ? "text-primary" : "text-slate-800"
                      )}
                    >
                      <span className="block truncate">
                        Balance sheet of {s.monthLabel}
                      </span>
                    </button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 shrink-0 rounded-full px-2.5 text-xs"
                      onClick={() => openPreview(s.id)}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Preview
                    </Button>
                  </div>
                );
              })}
            </div>
          </section>

          {selected && totals && (
            <section className="space-y-4">
              <div className="admin-panel">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b bg-primary/[0.05] px-5 py-4">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-primary">
                      Balance sheet of {selected.monthLabel}
                    </p>
                    <h2 className="mt-1 text-lg font-semibold text-slate-900">
                      {selected.title}
                    </h2>
                    <p className="mt-1 text-sm text-slate-600">
                      {selected.buildingName} · {statementKindLabel(selected.kind)}
                    </p>
                  </div>
                  <Badge className="h-6 bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/15">
                    Published
                  </Badge>
                </div>
                <dl className="grid gap-3 px-5 py-4 sm:grid-cols-3">
                  <div>
                    <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Prepared By
                    </dt>
                    <dd className="mt-1 text-sm font-medium text-slate-900">
                      {selected.preparedBy}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Entries
                    </dt>
                    <dd className="mt-1 text-sm font-medium tabular-nums text-slate-900">
                      {totals.entryCount}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Total Expenses
                    </dt>
                    <dd className="mt-1 text-base font-bold tabular-nums text-slate-900">
                      {formatCurrency(totals.totalAmount)}
                    </dd>
                  </div>
                </dl>
              </div>

              <StatementLineTable
                lines={selected.lines}
                readOnly
                descriptionLabel={
                  selected.kind === "income" ? "Income Description" : "Expense Description"
                }
                totalLabel={selected.kind === "income" ? "Total Income" : "Total Expenses"}
              />
            </section>
          )}
        </div>
      )}

      {previewOpen && selected && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-label="Balance sheet preview"
          onClick={() => setPreviewOpen(false)}
        >
          <div
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b bg-white px-5 py-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
                  Preview
                </p>
                <h3 className="text-lg font-semibold text-slate-900">
                  Balance sheet of {selected.monthLabel}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => window.print()}
                >
                  <Printer className="h-3.5 w-3.5" />
                  Print
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setPreviewOpen(false)}
                  aria-label="Close preview"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-4 p-5">
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                <p>
                  <span className="font-semibold">Building:</span> {selected.buildingName}
                </p>
                <p>
                  <span className="font-semibold">Statement:</span> {selected.title}
                </p>
                <p>
                  <span className="font-semibold">Prepared By:</span> {selected.preparedBy}
                </p>
              </div>
              <StatementLineTable
                lines={selected.lines}
                readOnly
                descriptionLabel={
                  selected.kind === "income" ? "Income Description" : "Expense Description"
                }
                totalLabel={selected.kind === "income" ? "Total Income" : "Total Expenses"}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
