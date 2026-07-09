"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  FileSpreadsheet,
  Pencil,
  Trash2,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ButtonLink } from "@/components/ui/button-link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ListToolbar } from "@/components/ui/list-toolbar";
import { routes } from "@/config/routes";
import { formatCurrency } from "@/lib/data";
import {
  deleteFinancialStatement,
  listFinancialStatements,
  sumStatementLines,
} from "@/lib/financial-statement-data";
import type { FinancialStatement } from "@/types/financial-statement";

function formatModified(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function FinancialStatementsWorkspace() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [statements, setStatements] = useState<FinancialStatement[]>(() =>
    listFinancialStatements()
  );

  const filtered = useMemo(() => {
    let list = statements;
    if (statusFilter !== "all") {
      list = list.filter((s) => s.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.monthLabel.toLowerCase().includes(q) ||
          s.buildingName.toLowerCase().includes(q)
      );
    }
    return list;
  }, [statements, search, statusFilter]);

  const handleDelete = (id: string) => {
    deleteFinancialStatement(id);
    setStatements(listFinancialStatements());
  };

  return (
    <div className="page-stack">
      <AdminPageHeader
        title="Balance Sheet"
        description="Create, edit, and publish monthly expense statements for Inspector and Resident portals."
        action={
          <ButtonLink href={routes.dashboard.admin.financialStatements.create} size="lg">
            Create statement
          </ButtonLink>
        }
      />

      <ListToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by month or title…"
        filters={[
          {
            id: "status",
            value: statusFilter,
            onChange: setStatusFilter,
            placeholder: "Status",
            options: [
              { value: "all", label: "All statuses" },
              { value: "draft", label: "Drafts" },
              { value: "published", label: "Published" },
            ],
          },
        ]}
        resultCount={{ shown: filtered.length, total: statements.length }}
      />

      {filtered.length === 0 ? (
        <section className="admin-panel p-8 text-center">
          <FileSpreadsheet className="mx-auto h-10 w-10 text-slate-400" />
          <p className="mt-3 text-sm text-slate-600">
            {statements.length === 0
              ? "No statements saved yet. Create your first monthly expense register."
              : "No statements match your filters."}
          </p>
          {statements.length === 0 && (
            <ButtonLink
              href={routes.dashboard.admin.financialStatements.create}
              className="mt-4"
            >
              Create statement
            </ButtonLink>
          )}
        </section>
      ) : (
        <ul className="space-y-3">
          {filtered.map((statement) => {
            const totals = sumStatementLines(statement.lines);
            const editHref = `${routes.dashboard.admin.financialStatements.create}?id=${encodeURIComponent(statement.id)}`;

            return (
              <li key={statement.id} className="admin-panel p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold text-slate-900">{statement.title}</h2>
                      {statement.status === "published" ? (
                        <Badge className="bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/15">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Published
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <Clock3 className="h-3.5 w-3.5" />
                          Draft
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-slate-600">
                      {statement.monthLabel} · {statement.buildingName}
                    </p>
                    <p className="mt-2 text-sm text-slate-500">
                      {totals.entryCount} entries · {formatCurrency(totals.totalAmount)} total
                      · Updated {formatModified(statement.updatedAt)}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <ButtonLink href={editHref} variant="outline" size="sm">
                      <Pencil className="h-3.5 w-3.5" />
                      {statement.status === "published" ? "View" : "Edit"}
                    </ButtonLink>
                    {statement.status === "draft" && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(statement.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <p className="text-xs text-slate-500">
        After publishing, verify in{" "}
        <Link
          href={routes.dashboard.inspector.financialStatements}
          className="font-medium text-primary underline-offset-2 hover:underline"
        >
          Inspector → Balance Sheet
        </Link>{" "}
        or{" "}
        <Link
          href={routes.dashboard.resident.financialStatements}
          className="font-medium text-primary underline-offset-2 hover:underline"
        >
          Resident → Balance Sheet
        </Link>
        .
      </p>
    </div>
  );
}
