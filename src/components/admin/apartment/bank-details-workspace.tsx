"use client";

import { Button } from "@/components/ui/button";
import { Building2, CreditCard } from "lucide-react";
import { DEMO_BANK_DETAILS } from "@/lib/admin-portal-data";

export function BankDetailsWorkspace() {
  const bank = DEMO_BANK_DETAILS;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          Society bank accounts and tax identifiers for maintenance collections.
        </p>
        <Button size="sm">Edit bank details</Button>
      </div>

      <div className="surface-card p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold">{bank.accountName}</h2>
            <p className="text-sm text-muted-foreground">
              {bank.bankName} · {bank.branch}
            </p>
          </div>
        </div>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          {[
            ["Account number", bank.accountNumber],
            ["IFSC", bank.ifsc],
            ["Account type", bank.accountType],
            ["GST number", bank.gstNumber],
            ["PAN", bank.panNumber],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
              <dd className="mt-0.5 font-medium tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="flex items-start gap-3 rounded-lg border border-dashed bg-muted/20 p-4 text-sm text-muted-foreground">
        <CreditCard className="mt-0.5 h-4 w-4 shrink-0" />
        <span>
          Payment gateway and UPI QR configuration will appear here when integrations are enabled
          under Settings.
        </span>
      </div>
    </div>
  );
}
