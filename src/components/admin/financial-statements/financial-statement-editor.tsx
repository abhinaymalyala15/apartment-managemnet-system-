"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Eye,
  FileSpreadsheet,
  ListOrdered,
  Loader2,
  Save,
  Send,
  UserRound,
  X,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { StatementLineTable } from "@/components/admin/financial-statements/statement-line-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Input } from "@/components/ui/input";
import { routes } from "@/config/routes";
import { formatCurrency } from "@/lib/data";
import {
  createDraftExpenseStatement,
  publishFinancialStatement,
  sumStatementLines,
  upsertFinancialStatement,
} from "@/lib/financial-statement-data";
import { cn } from "@/lib/utils";
import type {
  FinancialStatement,
  FinancialStatementLine,
  FinancialStatementStatus,
} from "@/types/financial-statement";

interface FinancialStatementEditorProps {
  buildingName: string;
  preparedBy?: string;
}

function StatusBadge({ status }: { status: FinancialStatementStatus }) {
  if (status === "published") {
    return (
      <Badge className="h-6 bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/15">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Published
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="h-6">
      <Clock3 className="h-3.5 w-3.5" />
      Draft
    </Badge>
  );
}

function MetaRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1 sm:grid-cols-[140px_minmax(0,1fr)] sm:items-center sm:gap-4">
      <dt className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
        {label}
      </dt>
      <dd className="min-w-0 text-base font-medium text-slate-900">{children}</dd>
    </div>
  );
}

function SummaryField({
  label,
  value,
  icon: Icon,
  emphasize,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  emphasize?: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 px-3.5 py-3">
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p
        className={cn(
          "mt-1.5 truncate text-sm font-semibold text-slate-900",
          emphasize && "text-xl font-bold tabular-nums tracking-tight"
        )}
      >
        {value}
      </p>
    </div>
  );
}

function formatModified(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function FinancialStatementEditor({
  buildingName,
  preparedBy = "Apartment Administrator",
}: FinancialStatementEditorProps) {
  const [statement, setStatement] = useState<FinancialStatement>(() =>
    createDraftExpenseStatement({ buildingName, preparedBy })
  );
  const [previewOpen, setPreviewOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const totals = useMemo(
    () => sumStatementLines(statement.lines),
    [statement.lines]
  );
  const readOnly = statement.status === "published";

  useEffect(() => {
    if (!message) return;
    const t = window.setTimeout(() => setMessage(null), 3200);
    return () => window.clearTimeout(t);
  }, [message]);

  const setLines = (lines: FinancialStatementLine[]) => {
    setStatement((prev) => ({
      ...prev,
      lines,
      updatedAt: new Date().toISOString(),
    }));
  };

  const saveDraft = () => {
    startTransition(() => {
      const saved = upsertFinancialStatement({
        ...statement,
        status: statement.status === "published" ? "published" : "draft",
      });
      setStatement(saved);
      setMessage("Draft saved locally.");
    });
  };

  const publish = () => {
    startTransition(() => {
      const published = publishFinancialStatement(statement);
      setStatement(published);
      setPreviewOpen(false);
      setMessage(
        "Statement published. Visible to Inspector and Resident portals (read-only)."
      );
    });
  };

  return (
    <div className="page-stack pb-8">
      <AdminPageHeader
        title="Create Monthly Financial Statement"
        description="Draft an expense register in an Excel-like sheet, then preview and publish for Inspector and Resident portals."
      />

      {message && (
        <div
          role="status"
          className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800"
        >
          {message}
        </div>
      )}

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-5">
          {/* Sticky statement header */}
          <section className="sticky top-0 z-20 overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 shadow-[0_8px_30px_rgb(0,0,0,0.06)] backdrop-blur supports-[backdrop-filter]:bg-white/90">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 bg-primary/[0.05] px-5 py-3.5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <FileSpreadsheet className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
                    Balance Sheet · Expense Register
                  </p>
                  <h2 className="text-base font-semibold text-slate-900">
                    {statement.title}
                  </h2>
                </div>
              </div>
              <StatusBadge status={statement.status} />
            </div>

            <dl className="space-y-3.5 px-5 py-5">
              <MetaRow label="Month">
                {readOnly ? (
                  statement.monthLabel
                ) : (
                  <Input
                    type="month"
                    value={statement.monthKey}
                    onChange={(e) => {
                      const monthKey = e.target.value;
                      const [y, m] = monthKey.split("-").map(Number);
                      const monthLabel = new Intl.DateTimeFormat("en-IN", {
                        month: "long",
                        year: "numeric",
                      }).format(new Date(y, m - 1, 1));
                      setStatement((prev) => ({
                        ...prev,
                        monthKey,
                        monthLabel,
                        id: `fs-${monthKey}-${prev.kind}`,
                        updatedAt: new Date().toISOString(),
                      }));
                    }}
                    className="h-9 max-w-[220px] bg-white"
                  />
                )}
              </MetaRow>
              <MetaRow label="Building">{statement.buildingName}</MetaRow>
              <MetaRow label="Statement">
                {readOnly ? (
                  statement.title
                ) : (
                  <Input
                    value={statement.title}
                    onChange={(e) =>
                      setStatement((prev) => ({
                        ...prev,
                        title: e.target.value,
                        updatedAt: new Date().toISOString(),
                      }))
                    }
                    className="h-9 max-w-md bg-white"
                  />
                )}
              </MetaRow>
              <MetaRow label="Prepared By">{statement.preparedBy}</MetaRow>
              <MetaRow label="Status">
                <StatusBadge status={statement.status} />
              </MetaRow>
            </dl>
          </section>

          <StatementLineTable
            lines={statement.lines}
            readOnly={readOnly}
            descriptionLabel="Expense Description"
            totalLabel="Total Expenses"
            onChange={setLines}
          />

          {/* Bottom actions */}
          <section className="sticky bottom-3 z-20 flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/95 p-3 shadow-[0_12px_40px_rgb(0,0,0,0.08)] backdrop-blur">
            {!readOnly && (
              <Button
                type="button"
                variant="outline"
                onClick={saveDraft}
                disabled={isPending}
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" data-icon="inline-start" />
                )}
                Save Draft
              </Button>
            )}
            <Button
              type="button"
              variant="secondary"
              onClick={() => setPreviewOpen(true)}
            >
              <Eye className="h-4 w-4" data-icon="inline-start" />
              Preview
            </Button>
            {!readOnly && (
              <Button type="button" onClick={publish} disabled={isPending}>
                <Send className="h-4 w-4" data-icon="inline-start" />
                Publish Statement
              </Button>
            )}
            <ButtonLink
              href={routes.dashboard.admin.root}
              variant="ghost"
              className="ml-auto"
            >
              <X className="h-4 w-4" />
              Cancel
            </ButtonLink>
          </section>
        </div>

        {/* Sticky summary card */}
        <aside className="xl:sticky xl:top-0">
          <div className="admin-panel">
            <div className="border-b border-primary/15 bg-primary/[0.06] px-5 py-4">
              <h2 className="text-base font-semibold text-slate-900">
                Statement Summary
              </h2>
              <p className="mt-0.5 text-sm text-slate-500">
                Live totals update as you edit rows.
              </p>
            </div>
            <div className="space-y-3 p-4">
              <SummaryField
                label="Month"
                value={statement.monthLabel}
                icon={CalendarDays}
              />
              <SummaryField
                label="Total Entries"
                value={String(totals.entryCount)}
                icon={ListOrdered}
              />
              <SummaryField
                label="Total Expense"
                value={formatCurrency(totals.totalAmount)}
                icon={FileSpreadsheet}
                emphasize
              />
              <SummaryField
                label="Status"
                value={statement.status === "published" ? "Published" : "Draft"}
                icon={CheckCircle2}
              />
              <SummaryField
                label="Prepared By"
                value={statement.preparedBy}
                icon={UserRound}
              />
              <SummaryField
                label="Last Modified"
                value={formatModified(statement.updatedAt)}
                icon={Clock3}
              />
            </div>
            {statement.status === "published" && (
              <div className="border-t border-slate-200 bg-emerald-50/80 px-4 py-3 text-xs leading-relaxed text-emerald-800">
                This statement is read-only. Inspectors and residents can view and
                print it under Monthly Financial Statement.
              </div>
            )}
          </div>
        </aside>
      </div>

      {previewOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-label="Statement preview"
          onClick={() => setPreviewOpen(false)}
        >
          <div
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 flex items-center justify-between gap-3 border-b bg-white px-5 py-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
                  Preview
                </p>
                <h3 className="text-lg font-semibold text-slate-900">
                  {statement.title}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => window.print()}
                >
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
                  <span className="font-semibold">Month:</span> {statement.monthLabel}
                </p>
                <p>
                  <span className="font-semibold">Building:</span>{" "}
                  {statement.buildingName}
                </p>
                <p>
                  <span className="font-semibold">Prepared By:</span>{" "}
                  {statement.preparedBy}
                </p>
              </div>
              <StatementLineTable
                lines={statement.lines}
                readOnly
                descriptionLabel="Expense Description"
                totalLabel="Total Expenses"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
