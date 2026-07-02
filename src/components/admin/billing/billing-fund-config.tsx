"use client";

import { Button } from "@/components/ui/button";
import { IndianRupee } from "lucide-react";

interface BillingFundConfigProps {
  title: string;
  description: string;
  rateLabel: string;
  rateValue: string;
  cycleLabel?: string;
  cycleValue?: string;
  notes?: string;
}

export function BillingFundConfig({
  title,
  description,
  rateLabel,
  rateValue,
  cycleLabel,
  cycleValue,
  notes,
}: BillingFundConfigProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{description}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Configure billing rules only. Inspectors record collections in Maintenance.
          </p>
        </div>
        <Button size="sm">Edit configuration</Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="surface-card p-5">
          <div className="flex items-center gap-2 text-muted-foreground">
            <IndianRupee className="h-4 w-4" />
            <span className="text-xs font-medium">{rateLabel}</span>
          </div>
          <p className="mt-2 text-2xl font-semibold">{rateValue}</p>
        </div>
        {cycleLabel && cycleValue && (
          <div className="surface-card p-5">
            <p className="text-xs font-medium text-muted-foreground">{cycleLabel}</p>
            <p className="mt-2 text-2xl font-semibold">{cycleValue}</p>
          </div>
        )}
      </div>

      {notes && (
        <div className="surface-card p-5">
          <h2 className="font-semibold">{title} notes</h2>
          <p className="mt-2 text-sm text-muted-foreground">{notes}</p>
        </div>
      )}
    </div>
  );
}
