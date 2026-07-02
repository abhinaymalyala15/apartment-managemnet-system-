"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFlatOps } from "@/components/inspector/flat/flat-ops-provider";
import type { FlatOperationsData } from "@/types";
import { getFlatStatementText } from "@/lib/flat-ops-data";

function DemoBanner({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss: () => void;
}) {
  return (
    <div className="rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm">
      <p className="font-medium text-success">{message}</p>
      <p className="mt-1 text-muted-foreground">
        Demo mode — changes are not saved to the database.
      </p>
      <Button size="sm" variant="outline" className="mt-3" onClick={onDismiss}>
        Close
      </Button>
    </div>
  );
}

export function FlatOpsDrawers({ data }: { data: FlatOperationsData }) {
  const { activeAction, closeAction } = useFlatOps();

  return (
    <>
      <GenericFormDrawer
        open={activeAction === "record-payment"}
        onOpenChange={(o) => !o && closeAction()}
        title="Record payment"
        description={`Log payment for Flat ${data.flatNumber}`}
        fields={[
          { id: "amount", label: "Amount (₹)", type: "number", defaultValue: "1300" },
          { id: "period", label: "Period", defaultValue: "July 2025" },
          {
            id: "mode",
            label: "Mode",
            type: "select",
            options: ["Cash", "UPI", "Cheque", "Bank transfer"],
          },
        ]}
        submitLabel="Record payment"
        successMessage="Payment recorded successfully."
      />
      <GenericFormDrawer
        open={activeAction === "edit-owner"}
        onOpenChange={(o) => !o && closeAction()}
        title="Edit owner"
        description={data.owner?.fullName ?? "Owner details"}
        fields={[
          { id: "name", label: "Name", defaultValue: data.owner?.fullName ?? "" },
          { id: "phone", label: "Mobile", defaultValue: data.owner?.phone ?? "" },
          { id: "email", label: "Email", defaultValue: data.owner?.email ?? "" },
        ]}
        submitLabel="Save owner"
        successMessage="Owner details updated."
      />
      <GenericFormDrawer
        open={activeAction === "replace-owner"}
        onOpenChange={(o) => !o && closeAction()}
        title="Replace owner"
        description="Register a new primary owner for this flat."
        fields={[
          { id: "name", label: "New owner name" },
          { id: "phone", label: "Mobile" },
          { id: "email", label: "Email" },
          { id: "date", label: "Ownership start", type: "date", defaultValue: "2025-07-02" },
        ]}
        submitLabel="Replace owner"
        successMessage="Owner replacement recorded."
      />
      <GenericFormDrawer
        open={activeAction === "add-tenant" || activeAction === "replace-tenant"}
        onOpenChange={(o) => !o && closeAction()}
        title={activeAction === "replace-tenant" ? "Replace tenant" : "Add tenant"}
        description={`Flat ${data.flatNumber}`}
        fields={[
          { id: "name", label: "Tenant name" },
          { id: "phone", label: "Mobile" },
          { id: "email", label: "Email" },
          { id: "leaseStart", label: "Lease start", type: "date", defaultValue: "2025-07-02" },
          { id: "leaseEnd", label: "Lease end", type: "date", defaultValue: "2026-06-30" },
        ]}
        submitLabel={activeAction === "replace-tenant" ? "Replace tenant" : "Add tenant"}
        successMessage="Tenant record updated."
      />
      <GenericFormDrawer
        open={activeAction === "end-tenancy"}
        onOpenChange={(o) => !o && closeAction()}
        title="End tenancy"
        description={data.tenant?.fullName ?? "End active lease"}
        fields={[
          { id: "endDate", label: "Move-out date", type: "date", defaultValue: "2025-07-02" },
          { id: "notes", label: "Notes", type: "textarea" },
        ]}
        submitLabel="End tenancy"
        successMessage="Tenancy ended and flat marked for update."
      />
      <GenericFormDrawer
        open={activeAction === "add-family" || activeAction === "edit-family"}
        onOpenChange={(o) => !o && closeAction()}
        title={activeAction === "edit-family" ? "Edit family member" : "Add family member"}
        description="Household members registered with the society."
        fields={[
          { id: "name", label: "Full name" },
          { id: "relationship", label: "Relationship", defaultValue: "Spouse" },
          { id: "phone", label: "Mobile" },
          { id: "dob", label: "Date of birth", type: "date" },
        ]}
        submitLabel="Save member"
        successMessage="Family member saved."
      />
      <GenericFormDrawer
        open={activeAction === "upload-document"}
        onOpenChange={(o) => !o && closeAction()}
        title="Upload document"
        description="Attach a file to this flat's record."
        fields={[
          {
            id: "category",
            label: "Category",
            type: "select",
            options: ["Ownership", "Receipt", "Rental agreement", "Parking", "Other"],
          },
          { id: "title", label: "Document title" },
        ]}
        submitLabel="Upload"
        successMessage="Document uploaded."
      />
      <GenericFormDrawer
        open={activeAction === "log-follow-up"}
        onOpenChange={(o) => !o && closeAction()}
        title="Log follow-up"
        description="Record contact outcome for payment follow-up."
        fields={[
          {
            id: "method",
            label: "Contact method",
            type: "select",
            options: ["Phone", "WhatsApp", "Email", "In person"],
          },
          { id: "outcome", label: "Outcome", type: "textarea" },
          { id: "nextDate", label: "Next follow-up", type: "date" },
        ]}
        submitLabel="Log follow-up"
        successMessage="Follow-up logged."
      />
      <StatementDrawer
        open={activeAction === "print-statement" || activeAction === "download-statement"}
        onOpenChange={(o) => !o && closeAction()}
        data={data}
        mode={activeAction === "download-statement" ? "download" : "print"}
      />
      <GenericFormDrawer
        open={activeAction === "print-receipt"}
        onOpenChange={(o) => !o && closeAction()}
        title="Print receipt"
        description={
          data.maintenance.lastPayment
            ? `${data.maintenance.lastPayment.period} · Receipt ${data.maintenance.lastPayment.receiptNumber ?? "—"}`
            : "No recent payment"
        }
        fields={[]}
        submitLabel="Print receipt"
        successMessage="Receipt sent to printer (demo)."
      />
    </>
  );
}

type FieldConfig = {
  id: string;
  label: string;
  type?: "text" | "number" | "date" | "select" | "textarea";
  defaultValue?: string;
  options?: string[];
};

function GenericFormDrawer({
  open,
  onOpenChange,
  title,
  description,
  fields,
  submitLabel,
  successMessage,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  fields: FieldConfig[];
  submitLabel: string;
  successMessage: string;
}) {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  function handleClose(next: boolean) {
    if (!next) setSubmitted(false);
    onOpenChange(next);
  }

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        {submitted ? (
          <div className="mt-6">
            <DemoBanner message={successMessage} onDismiss={() => handleClose(false)} />
          </div>
        ) : fields.length === 0 ? (
          <form onSubmit={handleSubmit} className="mt-6">
            <Button type="submit" className="w-full">
              {submitLabel}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {fields.map((field) => (
              <div key={field.id} className="space-y-2">
                <label htmlFor={field.id} className="text-sm font-medium">
                  {field.label}
                </label>
                {field.type === "select" ? (
                  <select
                    id={field.id}
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                    defaultValue={field.options?.[0]}
                  >
                    {field.options?.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : field.type === "textarea" ? (
                  <textarea
                    id={field.id}
                    rows={3}
                    className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  />
                ) : (
                  <Input
                    id={field.id}
                    type={field.type ?? "text"}
                    defaultValue={field.defaultValue}
                    required
                  />
                )}
              </div>
            ))}
            <Button type="submit" className="w-full">
              {submitLabel}
            </Button>
          </form>
        )}
      </SheetContent>
    </Sheet>
  );
}

function StatementDrawer({
  open,
  onOpenChange,
  data,
  mode,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: FlatOperationsData;
  mode: "print" | "download";
}) {
  const text = getFlatStatementText(data);

  function handleAction() {
    if (mode === "download") {
      const blob = new Blob([text], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `flat-${data.flatNumber}-statement.txt`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      window.print();
    }
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>
            {mode === "download" ? "Download statement" : "Print statement"}
          </SheetTitle>
          <SheetDescription>Flat {data.flatNumber} maintenance summary</SheetDescription>
        </SheetHeader>
        <pre className="mt-4 whitespace-pre-wrap rounded-lg border bg-muted/30 p-4 text-xs">
          {text}
        </pre>
        <Button className="mt-4 w-full" onClick={handleAction}>
          {mode === "download" ? "Download .txt" : "Print"}
        </Button>
      </SheetContent>
    </Sheet>
  );
}
