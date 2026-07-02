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
import { useSettingsActions } from "@/components/inspector/settings/settings-provider";
import { getMaintenanceBillingConfig } from "@/lib/settings-data";

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
        Demo mode — changes are not saved. Audit log would record this in production.
      </p>
      <Button size="sm" variant="outline" className="mt-3" onClick={onDismiss}>
        Close
      </Button>
    </div>
  );
}

export function SettingsDrawers() {
  const { activeAction, closeAction } = useSettingsActions();
  const config = getMaintenanceBillingConfig();

  return (
    <>
      <GenericSettingsDrawer
        open={activeAction === "edit-profile"}
        onOpenChange={(o) => !o && closeAction()}
        title="Edit apartment profile"
        description="Society identity, registration, and contact details."
        submitLabel="Save profile"
        successMessage="Apartment profile updated."
        fields={[
          { name: "name", label: "Society name", defaultValue: "Sylvan Shelter Apartment" },
          { name: "phone", label: "Primary phone", defaultValue: "+91 96396 33716" },
          { name: "email", label: "Email", defaultValue: "abhinaymalyala15@gmail.com", type: "email" },
        ]}
      />
      <GenericSettingsDrawer
        open={activeAction === "update-maintenance-rate"}
        onOpenChange={(o) => !o && closeAction()}
        title="Update maintenance rate"
        description="Rate changes require committee approval. Effective from next billing cycle."
        submitLabel="Save rate"
        successMessage="Maintenance rate updated. Finance module will use new rate."
        fields={[
          {
            name: "rate",
            label: "Rate per sq.ft (₹)",
            defaultValue: String(config.maintenanceRatePerSqft),
            type: "number",
          },
          {
            name: "effectiveFrom",
            label: "Effective from",
            defaultValue: config.effectiveFrom,
            type: "date",
          },
        ]}
      />
      <GenericSettingsDrawer
        open={activeAction === "add-committee"}
        onOpenChange={(o) => !o && closeAction()}
        title="Add committee member"
        description="RWA committee roster visible to residents."
        submitLabel="Add member"
        successMessage="Committee member added."
        fields={[
          { name: "name", label: "Full name", required: true },
          { name: "role", label: "Role", placeholder: "e.g. Vice President" },
          { name: "phone", label: "Phone", required: true },
          { name: "email", label: "Email", type: "email" },
        ]}
      />
      <GenericSettingsDrawer
        open={activeAction === "add-emergency"}
        onOpenChange={(o) => !o && closeAction()}
        title="Add emergency contact"
        description="Displayed on resident portal and family page."
        submitLabel="Add contact"
        successMessage="Emergency contact added."
        fields={[
          { name: "label", label: "Label", placeholder: "e.g. Ambulance" },
          { name: "phone", label: "Phone", required: true },
          { name: "hours", label: "Hours", defaultValue: "24/7" },
          { name: "role", label: "Description" },
        ]}
      />
      <GenericSettingsDrawer
        open={activeAction === "add-staff"}
        onOpenChange={(o) => !o && closeAction()}
        title="Add staff member"
        description="Assign role and block scope for access control."
        submitLabel="Add staff"
        successMessage="Staff member added. Invite email would be sent in production."
        fields={[
          { name: "fullName", label: "Full name", required: true },
          { name: "phone", label: "Phone", required: true },
          { name: "email", label: "Email", type: "email", required: true },
          { name: "department", label: "Department" },
        ]}
      />
      <GenericSettingsDrawer
        open={activeAction === "edit-preferences"}
        onOpenChange={(o) => !o && closeAction()}
        title="Edit system preferences"
        description="Locale, billing cycle, and notification defaults."
        submitLabel="Save preferences"
        successMessage="System preferences updated."
        fields={[
          { name: "timezone", label: "Timezone", defaultValue: "Asia/Kolkata" },
          { name: "currency", label: "Currency", defaultValue: "INR" },
        ]}
      />
    </>
  );
}

function GenericSettingsDrawer({
  open,
  onOpenChange,
  title,
  description,
  submitLabel,
  successMessage,
  fields,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  submitLabel: string;
  successMessage: string;
  fields: Array<{
    name: string;
    label: string;
    defaultValue?: string;
    placeholder?: string;
    type?: string;
    required?: boolean;
  }>;
}) {
  const [submitted, setSubmitted] = useState(false);

  const handleOpenChange = (next: boolean) => {
    if (!next) setSubmitted(false);
    onOpenChange(next);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        {submitted ? (
          <div className="mt-6">
            <DemoBanner
              message={successMessage}
              onDismiss={() => handleOpenChange(false)}
            />
          </div>
        ) : (
          <form
            className="mt-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
            }}
          >
            {fields.map((field) => (
              <div key={field.name} className="space-y-1.5">
                <label htmlFor={field.name} className="text-sm font-medium">
                  {field.label}
                </label>
                <Input
                  id={field.name}
                  name={field.name}
                  type={field.type ?? "text"}
                  defaultValue={field.defaultValue}
                  placeholder={field.placeholder}
                  required={field.required}
                />
              </div>
            ))}
            <div className="flex gap-2 pt-2">
              <Button type="submit">{submitLabel}</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </SheetContent>
    </Sheet>
  );
}
