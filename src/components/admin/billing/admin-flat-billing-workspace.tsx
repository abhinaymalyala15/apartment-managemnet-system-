"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  IndianRupee,
  Pencil,
  RotateCcw,
  Sparkles,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ListToolbar } from "@/components/ui/list-toolbar";
import { useBillingSetup } from "@/components/admin/billing/billing-setup-provider";
import { formatCurrency } from "@/lib/billing-setup-data";
import type { FlatBillingRow, FlatBillingStatus } from "@/types";
import { cn } from "@/lib/utils";

const statusConfig: Record<
  FlatBillingStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  paid: { label: "Paid", variant: "default" },
  pending: { label: "Pending", variant: "secondary" },
  overdue: { label: "Overdue", variant: "destructive" },
};

export function AdminFlatBillingWorkspace() {
  const {
    rows,
    summary,
    otherColumnLabel,
    billingPeriod,
    ratePerSqft,
    setOtherColumnLabel,
    setBillingPeriod,
    setRatePerSqft,
    setMaintenanceAmount,
    setOtherAmount,
    applyRateToAllFlats,
    applyOtherToAllFlats,
    markMaintenancePaid,
    restorePending,
  } = useBillingSetup();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingLabel, setEditingLabel] = useState(false);
  const [labelDraft, setLabelDraft] = useState(otherColumnLabel);
  const [bulkOther, setBulkOther] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((row) => {
      if (statusFilter !== "all" && row.maintenanceStatus !== statusFilter) return false;
      if (!q) return true;
      return (
        row.flatNumber.includes(q) ||
        row.blockName.toLowerCase().includes(q) ||
        (row.residentName?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [rows, search, statusFilter]);

  function saveOtherLabel() {
    const trimmed = labelDraft.trim() || "Other";
    setOtherColumnLabel(trimmed);
    setEditingLabel(false);
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Assign maintenance for every flat, add optional external charges under{" "}
        <span className="font-medium text-foreground">{otherColumnLabel}</span>, and
        manually clear pending when a resident pays offline. Inspectors record day-to-day
        collections in the Maintenance module.
      </p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Flats", summary.flatCount],
          ["Pending", summary.pendingCount],
          ["Paid / cleared", summary.paidCount],
          ["Period", billingPeriod],
        ].map(([label, value]) => (
          <div key={label} className="surface-card p-4">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-1 text-xl font-semibold tabular-nums">{value}</p>
          </div>
        ))}
      </div>

      <section className="surface-card p-5">
        <h2 className="font-semibold">Bulk actions</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Apply rates across all flats, or push an external charge to everyone at once.
        </p>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border bg-muted/20 p-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <IndianRupee className="h-4 w-4 text-primary" />
              Maintenance rate
            </div>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end">
              <label className="min-w-0 flex-1 space-y-1">
                <span className="text-xs text-muted-foreground">₹ per sq.ft</span>
                <Input
                  type="number"
                  min={0}
                  step={0.5}
                  value={ratePerSqft}
                  onChange={(e) => setRatePerSqft(Number(e.target.value))}
                  className="tabular-nums"
                />
              </label>
              <Button size="sm" className="w-full sm:w-auto" onClick={applyRateToAllFlats}>
                <Sparkles className="mr-1.5 h-4 w-4" />
                Apply to all flats
              </Button>
            </div>
          </div>

          <div className="rounded-xl border bg-muted/20 p-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Users className="h-4 w-4 text-primary" />
              {otherColumnLabel} — add to all
            </div>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end">
              <label className="min-w-0 flex-1 space-y-1">
                <span className="text-xs text-muted-foreground">Amount (₹)</span>
                <Input
                  type="number"
                  min={0}
                  placeholder="e.g. 350 for water bill"
                  value={bulkOther}
                  onChange={(e) => setBulkOther(e.target.value)}
                  className="tabular-nums"
                />
              </label>
              <Button
                size="sm"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => {
                  const amount = Number(bulkOther);
                  if (!Number.isNaN(amount)) applyOtherToAllFlats(amount);
                }}
              >
                Add to all flats
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="text-sm text-muted-foreground">Billing period</label>
          <Input
            value={billingPeriod}
            onChange={(e) => setBillingPeriod(e.target.value)}
            className="max-w-xs"
          />
        </div>
      </section>

      <ListToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search flat, block, or resident…"
        filters={[
          {
            id: "status",
            value: statusFilter,
            onChange: setStatusFilter,
            placeholder: "Status",
            options: [
              { value: "all", label: "All statuses" },
              { value: "pending", label: "Pending" },
              { value: "overdue", label: "Overdue" },
              { value: "paid", label: "Paid / cleared" },
            ],
          },
        ]}
        resultCount={{ shown: filtered.length, total: rows.length }}
      />

      <div className="surface-card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 sm:px-5">
          <h2 className="font-semibold">Flat billing</h2>
          {editingLabel ? (
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
              <Input
                value={labelDraft}
                onChange={(e) => setLabelDraft(e.target.value)}
                placeholder="Column name (e.g. Water bill)"
                className="h-8 sm:w-48"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={saveOtherLabel}>
                  Save name
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setLabelDraft(otherColumnLabel);
                    setEditingLabel(false);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setLabelDraft(otherColumnLabel);
                setEditingLabel(true);
              }}
            >
              <Pencil className="mr-1.5 h-4 w-4" />
              Rename &quot;{otherColumnLabel}&quot; column
            </Button>
          )}
        </div>

        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full min-w-[880px] text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
                <th className="px-4 py-3 font-medium">Flat</th>
                <th className="px-4 py-3 font-medium">Resident</th>
                <th className="px-4 py-3 font-medium">Maintenance (₹)</th>
                <th className="px-4 py-3 font-medium">{otherColumnLabel} (₹)</th>
                <th className="px-4 py-3 font-medium">Total due</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((row) => (
                <FlatBillingTableRow
                  key={row.flatId}
                  row={row}
                  otherColumnLabel={otherColumnLabel}
                  onMaintenanceChange={setMaintenanceAmount}
                  onOtherChange={setOtherAmount}
                  onMarkPaid={markMaintenancePaid}
                  onRestorePending={restorePending}
                />
              ))}
            </tbody>
          </table>
        </div>

        <ul className="divide-y lg:hidden">
          {filtered.map((row) => (
            <FlatBillingMobileCard
              key={row.flatId}
              row={row}
              otherColumnLabel={otherColumnLabel}
              onMaintenanceChange={setMaintenanceAmount}
              onOtherChange={setOtherAmount}
              onMarkPaid={markMaintenancePaid}
              onRestorePending={restorePending}
            />
          ))}
        </ul>

        {filtered.length === 0 && (
          <p className="px-4 py-10 text-center text-sm text-muted-foreground">
            No flats match your search.
          </p>
        )}
      </div>
    </div>
  );
}

function FlatBillingTableRow({
  row,
  otherColumnLabel,
  onMaintenanceChange,
  onOtherChange,
  onMarkPaid,
  onRestorePending,
}: {
  row: FlatBillingRow;
  otherColumnLabel: string;
  onMaintenanceChange: (flatId: string, amount: number) => void;
  onOtherChange: (flatId: string, amount: number) => void;
  onMarkPaid: (flatId: string) => void;
  onRestorePending: (flatId: string) => void;
}) {
  const status = statusConfig[row.maintenanceStatus];

  return (
    <tr className="hover:bg-muted/20">
      <td className="px-4 py-3">
        <p className="font-semibold tabular-nums">{row.flatNumber}</p>
        <p className="text-xs text-muted-foreground">
          {row.blockName} · {row.areaSqft} sq.ft
        </p>
      </td>
      <td className="px-4 py-3 text-muted-foreground">{row.residentName ?? "—"}</td>
      <td className="px-4 py-3">
        <AmountInput
          value={row.maintenanceAmount}
          disabled={row.maintenanceStatus === "paid"}
          onChange={(v) => onMaintenanceChange(row.flatId, v)}
        />
      </td>
      <td className="px-4 py-3">
        <AmountInput
          value={row.otherAmount}
          onChange={(v) => onOtherChange(row.flatId, v)}
          ariaLabel={`${otherColumnLabel} for flat ${row.flatNumber}`}
        />
      </td>
      <td className="px-4 py-3 font-medium tabular-nums">{formatCurrency(row.totalDue)}</td>
      <td className="px-4 py-3">
        <Badge variant={status.variant}>{status.label}</Badge>
        {row.manuallyClearedAt && (
          <p className="mt-1 text-[10px] text-muted-foreground">Manually cleared</p>
        )}
      </td>
      <td className="px-4 py-3">
        <FlatBillingActions
          row={row}
          onMarkPaid={onMarkPaid}
          onRestorePending={onRestorePending}
        />
      </td>
    </tr>
  );
}

function FlatBillingMobileCard({
  row,
  otherColumnLabel,
  onMaintenanceChange,
  onOtherChange,
  onMarkPaid,
  onRestorePending,
}: {
  row: FlatBillingRow;
  otherColumnLabel: string;
  onMaintenanceChange: (flatId: string, amount: number) => void;
  onOtherChange: (flatId: string, amount: number) => void;
  onMarkPaid: (flatId: string) => void;
  onRestorePending: (flatId: string) => void;
}) {
  const status = statusConfig[row.maintenanceStatus];

  return (
    <li className="space-y-3 px-4 py-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold tabular-nums">Flat {row.flatNumber}</p>
          <p className="text-xs text-muted-foreground">
            {row.blockName} · {row.residentName ?? "No resident"}
          </p>
        </div>
        <Badge variant={status.variant}>{status.label}</Badge>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <label className="space-y-1">
          <span className="text-xs text-muted-foreground">Maintenance</span>
          <AmountInput
            value={row.maintenanceAmount}
            disabled={row.maintenanceStatus === "paid"}
            onChange={(v) => onMaintenanceChange(row.flatId, v)}
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs text-muted-foreground">{otherColumnLabel}</span>
          <AmountInput
            value={row.otherAmount}
            onChange={(v) => onOtherChange(row.flatId, v)}
          />
        </label>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Total due</span>
        <span className="font-semibold tabular-nums">{formatCurrency(row.totalDue)}</span>
      </div>
      <FlatBillingActions
        row={row}
        onMarkPaid={onMarkPaid}
        onRestorePending={onRestorePending}
        fullWidth
      />
    </li>
  );
}

function AmountInput({
  value,
  onChange,
  disabled,
  ariaLabel,
}: {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  ariaLabel?: string;
}) {
  return (
    <Input
      type="number"
      min={0}
      value={value}
      disabled={disabled}
      aria-label={ariaLabel}
      onChange={(e) => onChange(Number(e.target.value) || 0)}
      className={cn("h-8 w-24 tabular-nums", disabled && "opacity-60")}
    />
  );
}

function FlatBillingActions({
  row,
  onMarkPaid,
  onRestorePending,
  fullWidth,
}: {
  row: FlatBillingRow;
  onMarkPaid: (flatId: string) => void;
  onRestorePending: (flatId: string) => void;
  fullWidth?: boolean;
}) {
  if (row.maintenanceStatus === "paid") {
    return (
      <Button
        size="sm"
        variant="outline"
        className={fullWidth ? "w-full" : undefined}
        onClick={() => onRestorePending(row.flatId)}
      >
        <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
        Mark pending again
      </Button>
    );
  }

  return (
    <Button
      size="sm"
      variant="outline"
      className={cn(fullWidth && "w-full", "text-success hover:text-success")}
      onClick={() => onMarkPaid(row.flatId)}
    >
      <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
      Clear pending
    </Button>
  );
}
