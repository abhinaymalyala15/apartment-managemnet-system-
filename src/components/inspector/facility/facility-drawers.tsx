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
import { useFacilityActions } from "@/components/inspector/facility/facility-provider";
import { getCommunityAssets } from "@/lib/asset-data";

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
        Demo mode — changes are not saved. Timeline would update on save.
      </p>
      <Button size="sm" variant="outline" className="mt-3" onClick={onDismiss}>
        Close
      </Button>
    </div>
  );
}

export function FacilityDrawers() {
  const { activeAction, actionContext, closeAction } = useFacilityActions();

  return (
    <>
      <GenericFacilityDrawer
        open={activeAction === "schedule-service"}
        onOpenChange={(o) => !o && closeAction()}
        title="Schedule service"
        description={
          actionContext.assetName
            ? `Schedule maintenance for ${actionContext.assetName}`
            : "Book a vendor visit"
        }
        submitLabel="Schedule service"
        successMessage="Service scheduled. Asset timeline updated."
      />
      <GenericFacilityDrawer
        open={activeAction === "complete-service"}
        onOpenChange={(o) => !o && closeAction()}
        title="Complete service"
        description="Record completion, technician, and remarks."
        submitLabel="Mark completed"
        successMessage="Service marked complete."
        showTechnician
      />
      <GenericFacilityDrawer
        open={activeAction === "renew-amc"}
        onOpenChange={(o) => !o && closeAction()}
        title="Renew AMC"
        description={
          actionContext.assetName
            ? `AMC renewal for ${actionContext.assetName}`
            : "Update AMC contract"
        }
        submitLabel="Save AMC"
        successMessage="AMC renewal recorded."
        showAmcFields
      />
      <GenericFacilityDrawer
        open={activeAction === "upload-document"}
        onOpenChange={(o) => !o && closeAction()}
        title="Upload document"
        description="Manual, warranty, AMC agreement, or service report."
        submitLabel="Upload"
        successMessage="Document uploaded to asset profile."
        showDocumentFields
      />
      <GenericFacilityDrawer
        open={activeAction === "add-note"}
        onOpenChange={(o) => !o && closeAction()}
        title="Add internal note"
        description="Admin-only — not visible to residents."
        submitLabel="Save note"
        successMessage="Internal note added."
        showNoteField
      />
    </>
  );
}

function GenericFacilityDrawer({
  open,
  onOpenChange,
  title,
  description,
  submitLabel,
  successMessage,
  showTechnician,
  showAmcFields,
  showDocumentFields,
  showNoteField,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  submitLabel: string;
  successMessage: string;
  showTechnician?: boolean;
  showAmcFields?: boolean;
  showDocumentFields?: boolean;
  showNoteField?: boolean;
}) {
  const [submitted, setSubmitted] = useState(false);
  const assets = getCommunityAssets();

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
      <SheetContent className="overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        {submitted ? (
          <div className="mt-6">
            <DemoBanner
              message={successMessage}
              onDismiss={() => handleClose(false)}
            />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {!showNoteField && !showAmcFields && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Asset</label>
                <select
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                  defaultValue={assets[0]?.id}
                >
                  {assets.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {showAmcFields && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">AMC start</label>
                  <Input type="date" defaultValue="2025-07-01" required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">AMC end</label>
                  <Input type="date" defaultValue="2026-06-30" required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Contact person</label>
                  <Input defaultValue="Vendor contact" required />
                </div>
              </>
            )}
            {showDocumentFields && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Document type</label>
                <select className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm">
                  <option value="manual">Manual</option>
                  <option value="warranty">Warranty</option>
                  <option value="amc_agreement">AMC agreement</option>
                  <option value="certificate">Certificate</option>
                  <option value="service_report">Service report</option>
                </select>
              </div>
            )}
            {!showAmcFields && !showNoteField && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Scheduled date</label>
                  <Input type="date" defaultValue="2025-07-15" required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Vendor</label>
                  <Input placeholder="Vendor name" required />
                </div>
              </>
            )}
            {showTechnician && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Technician</label>
                  <Input placeholder="Technician name" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Remarks</label>
                  <textarea
                    rows={3}
                    className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
              </>
            )}
            {showNoteField && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Note</label>
                <textarea
                  rows={4}
                  required
                  className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Internal facility note…"
                />
              </div>
            )}
            {!showDocumentFields && !showNoteField && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Checklist (optional)</label>
                <Input placeholder="e.g. Oil check, Load test" />
              </div>
            )}
            {showDocumentFields && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input placeholder="Document title" required />
              </div>
            )}
            <Button type="submit" className="w-full">
              {submitLabel}
            </Button>
          </form>
        )}
      </SheetContent>
    </Sheet>
  );
}
