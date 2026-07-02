"use client";

import { useSettingsActions } from "@/components/inspector/settings/settings-provider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { MaintenanceBillingConfig } from "@/types";
import { formatCurrency } from "@/lib/data";
import { Calendar, IndianRupee, Percent } from "lucide-react";

interface MaintenanceConfigWorkspaceProps {
  config: MaintenanceBillingConfig;
  preview: {
    monthlyPerFlat: number;
    formattedMonthly: string;
    currentCycle: string;
    collectionRate: number;
  };
}

export function MaintenanceConfigWorkspace({
  config,
  preview,
}: MaintenanceConfigWorkspaceProps) {
  const { openAction } = useSettingsActions();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          Billing rules approved by committee. Finance module uses these rates.
        </p>
        <Button size="sm" onClick={() => openAction("update-maintenance-rate")}>
          Update rate
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="surface-card p-5">
          <div className="flex items-center gap-2 text-muted-foreground">
            <IndianRupee className="h-4 w-4" />
            <span className="text-xs font-medium">Rate per sq.ft</span>
          </div>
          <p className="mt-2 text-2xl font-semibold">
            ₹{config.maintenanceRatePerSqft}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {preview.formattedMonthly} / flat ({config.defaultFlatAreaSqft} sq.ft)
          </p>
        </div>
        <div className="surface-card p-5">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span className="text-xs font-medium">Billing cycle</span>
          </div>
          <p className="mt-2 text-2xl font-semibold">Day {config.billingCycleDay}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Current: {preview.currentCycle}
          </p>
        </div>
        <div className="surface-card p-5">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Percent className="h-4 w-4" />
            <span className="text-xs font-medium">Late fee</span>
          </div>
          <p className="mt-2 text-2xl font-semibold">{config.lateFeePercent}%</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {config.lateFeeGraceDays} day grace period
          </p>
        </div>
      </div>

      <div className="surface-card p-5">
        <h2 className="font-semibold">Configuration details</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          {[
            ["Effective from", config.effectiveFrom],
            ["Approved by", config.approvedBy],
            ["GST applicable", config.gstApplicable ? `Yes (${config.gstPercent}%)` : "No"],
            ["Collection rate", `${preview.collectionRate}%`],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs text-muted-foreground">{label}</dt>
              <dd className="mt-0.5 font-medium">{value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
          {config.notes}
        </p>
        <p className="mt-3 text-xs text-muted-foreground">
          Estimated monthly bill per flat:{" "}
          <span className="font-medium text-foreground">
            {formatCurrency(preview.monthlyPerFlat)}
          </span>
        </p>
      </div>
    </div>
  );
}
