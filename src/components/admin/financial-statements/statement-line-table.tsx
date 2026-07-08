"use client";

import { Copy, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/data";
import { cn } from "@/lib/utils";
import type { FinancialStatementLine } from "@/types/financial-statement";

export interface StatementLineTableProps {
  lines: FinancialStatementLine[];
  readOnly?: boolean;
  /** Column header for the description field — "Expense Description" or "Income Description". */
  descriptionLabel?: string;
  totalLabel?: string;
  onChange?: (lines: FinancialStatementLine[]) => void;
  className?: string;
}

function parseAmountInput(raw: string): number {
  const cleaned = raw.replace(/[^\d.]/g, "");
  if (!cleaned) return 0;
  const value = Number(cleaned);
  if (!Number.isFinite(value) || value < 0) return 0;
  return Math.round(value);
}

export function StatementLineTable({
  lines,
  readOnly = false,
  descriptionLabel = "Expense Description",
  totalLabel = "Total Expenses",
  onChange,
  className,
}: StatementLineTableProps) {
  const total = lines.reduce((sum, line) => sum + (Number(line.amount) || 0), 0);

  const updateLine = (id: string, patch: Partial<FinancialStatementLine>) => {
    if (!onChange || readOnly) return;
    onChange(lines.map((line) => (line.id === id ? { ...line, ...patch } : line)));
  };

  const addRow = () => {
    if (!onChange || readOnly) return;
    onChange([
      ...lines,
      {
        id:
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `line-${Date.now()}`,
        description: "",
        amount: 0,
      },
    ]);
  };

  const deleteRow = (id: string) => {
    if (!onChange || readOnly) return;
    if (lines.length <= 1) {
      onChange([{ id: lines[0]?.id ?? `line-${Date.now()}`, description: "", amount: 0 }]);
      return;
    }
    onChange(lines.filter((line) => line.id !== id));
  };

  const duplicateRow = (id: string) => {
    if (!onChange || readOnly) return;
    const index = lines.findIndex((line) => line.id === id);
    if (index < 0) return;
    const source = lines[index];
    const copy: FinancialStatementLine = {
      id:
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `line-${Date.now()}`,
      description: source.description,
      amount: source.amount,
    };
    const next = [...lines];
    next.splice(index + 1, 0, copy);
    onChange(next);
  };

  return (
    <div className={cn("overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.05)]", className)}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead className="sticky top-0 z-10">
            <tr className="admin-table-head">
              <th className="w-16 px-4 py-3.5 text-center">S.No</th>
              <th className="px-4 py-3.5">{descriptionLabel}</th>
              <th className="w-40 px-4 py-3.5 text-right">Amount</th>
              {!readOnly && (
                <th className="w-[132px] px-4 py-3.5 text-center">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {lines.map((line, index) => (
              <tr
                key={line.id}
                className={cn(
                  "border-b border-slate-100 transition-colors last:border-0",
                  index % 2 === 0 ? "bg-white" : "bg-slate-50/70",
                  "hover:bg-primary/[0.04]"
                )}
              >
                <td className="px-4 py-2.5 text-center tabular-nums text-slate-500">
                  {index + 1}
                </td>
                <td className="px-3 py-2">
                  {readOnly ? (
                    <span className="block px-1.5 py-1.5 text-[15px] text-slate-900">
                      {line.description || "—"}
                    </span>
                  ) : (
                    <Input
                      value={line.description}
                      onChange={(e) =>
                        updateLine(line.id, { description: e.target.value })
                      }
                      placeholder="Enter expense description"
                      className="h-10 border-transparent bg-transparent text-[15px] shadow-none hover:border-slate-200 hover:bg-white focus-visible:border-ring focus-visible:bg-white"
                      aria-label={`Row ${index + 1} description`}
                    />
                  )}
                </td>
                <td className="px-3 py-2 text-right">
                  {readOnly ? (
                    <span className="block px-1.5 py-1.5 text-[15px] font-semibold tabular-nums text-slate-900">
                      {formatCurrency(line.amount)}
                    </span>
                  ) : (
                    <div className="relative">
                      <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-slate-400">
                        ₹
                      </span>
                      <Input
                        inputMode="decimal"
                        value={line.amount ? String(line.amount) : ""}
                        onChange={(e) =>
                          updateLine(line.id, {
                            amount: parseAmountInput(e.target.value),
                          })
                        }
                        placeholder="0"
                        className="h-10 border-transparent bg-transparent pl-7 text-right text-[15px] font-semibold tabular-nums shadow-none hover:border-slate-200 hover:bg-white focus-visible:border-ring focus-visible:bg-white"
                        aria-label={`Row ${index + 1} amount`}
                      />
                    </div>
                  )}
                </td>
                {!readOnly && (
                  <td className="px-2 py-2">
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => duplicateRow(line.id)}
                        aria-label={`Duplicate row ${index + 1}`}
                        title="Duplicate row"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => deleteRow(line.id)}
                        aria-label={`Delete row ${index + 1}`}
                        title="Delete row"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
          <tfoot className="sticky bottom-0 z-10">
            <tr className="border-t-2 border-slate-300 bg-slate-100/95">
              <td className="px-4 py-4" />
              <td className="px-4 py-4 text-right text-sm font-bold uppercase tracking-wide text-slate-700">
                {totalLabel}
              </td>
              <td className="px-4 py-4 text-right text-lg font-bold tabular-nums text-slate-900">
                {formatCurrency(total)}
              </td>
              {!readOnly && <td className="px-4 py-4" />}
            </tr>
          </tfoot>
        </table>
      </div>

      {!readOnly && (
        <div className="flex items-center justify-between gap-3 border-t border-slate-200 bg-slate-50/80 px-4 py-3">
          <p className="text-xs text-slate-500">
            {lines.length} row{lines.length === 1 ? "" : "s"} · amounts in INR
          </p>
          <Button type="button" variant="outline" size="sm" onClick={addRow}>
            <Plus className="h-3.5 w-3.5" data-icon="inline-start" />
            Add Row
          </Button>
        </div>
      )}
    </div>
  );
}
