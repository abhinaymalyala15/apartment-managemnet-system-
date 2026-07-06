"use client";

import { Button } from "@/components/ui/button";
import { Calendar, IndianRupee } from "lucide-react";
import { AdminPanel, AdminStatCard } from "@/components/admin/ui/admin-primitives";

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
    <div className="space-y-5">
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
        <AdminStatCard label={rateLabel} value={rateValue} icon={IndianRupee} />
        {cycleLabel && cycleValue && (
          <AdminStatCard label={cycleLabel} value={cycleValue} icon={Calendar} accent="muted" />
        )}
      </div>

      {notes && (
        <AdminPanel title={`${title} notes`}>
          <p className="text-sm text-muted-foreground">{notes}</p>
        </AdminPanel>
      )}
    </div>
  );
}
