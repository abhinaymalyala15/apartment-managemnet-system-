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
import { useAdminActions } from "@/components/inspector/admin-action-provider";
import { getResidentTableRows } from "@/lib/data";

export function AdminActionDrawers() {
  const { activeAction, closeAction } = useAdminActions();

  return (
    <>
      <RecordPaymentDrawer
        open={activeAction === "record-payment"}
        onOpenChange={(open) => !open && closeAction()}
      />
      <PublishNoticeDrawer
        open={activeAction === "publish-notice"}
        onOpenChange={(open) => !open && closeAction()}
      />
      <LogComplaintDrawer
        open={activeAction === "log-complaint"}
        onOpenChange={(open) => !open && closeAction()}
      />
      <ScheduleServiceDrawer
        open={activeAction === "schedule-service"}
        onOpenChange={(open) => !open && closeAction()}
      />
    </>
  );
}

function LogComplaintDrawer({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [submitted, setSubmitted] = useState(false);
  const flats = getResidentTableRows().filter((r) => r.occupancyStatus !== "vacant");

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
          <SheetTitle>Log complaint</SheetTitle>
          <SheetDescription>
            Record a resident complaint received at the office or by phone.
          </SheetDescription>
        </SheetHeader>

        {submitted ? (
          <div className="mt-6">
            <DemoSuccessBanner
              message="Complaint logged successfully."
              onDismiss={() => handleClose(false)}
            />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <label htmlFor="complaint-flat" className="text-sm font-medium">
                Flat
              </label>
              <select
                id="complaint-flat"
                required
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                defaultValue=""
              >
                <option value="" disabled>
                  Select flat…
                </option>
                {flats.map((flat) => (
                  <option key={flat.id} value={flat.id}>
                    Flat {flat.flatNumber} — {flat.residentName}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="complaint-title" className="text-sm font-medium">
                Subject
              </label>
              <Input id="complaint-title" placeholder="Brief summary" required />
            </div>
            <div className="space-y-2">
              <label htmlFor="complaint-priority" className="text-sm font-medium">
                Priority
              </label>
              <select
                id="complaint-priority"
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                defaultValue="medium"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="complaint-body" className="text-sm font-medium">
                Details
              </label>
              <textarea
                id="complaint-body"
                required
                rows={4}
                placeholder="Describe the issue…"
                className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <Button type="submit" className="w-full">
              Log complaint
            </Button>
          </form>
        )}
      </SheetContent>
    </Sheet>
  );
}

function DemoSuccessBanner({
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
        Demo mode — no data was saved. Use Finance → Record payment for the full workflow.
      </p>
      <Button size="sm" variant="outline" className="mt-3" onClick={onDismiss}>
        Close
      </Button>
    </div>
  );
}

function RecordPaymentDrawer({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [submitted, setSubmitted] = useState(false);
  const flats = getResidentTableRows().filter((r) => r.occupancyStatus !== "vacant");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  function handleClose(next: boolean) {
    if (!next) {
      setSubmitted(false);
    }
    onOpenChange(next);
  }

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Record payment</SheetTitle>
          <SheetDescription>
            Manually record a maintenance or other payment received at the office.
          </SheetDescription>
        </SheetHeader>

        {submitted ? (
          <div className="mt-6">
            <DemoSuccessBanner
              message="Payment recorded successfully."
              onDismiss={() => handleClose(false)}
            />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <label htmlFor="pay-flat" className="text-sm font-medium">
                Flat
              </label>
              <select
                id="pay-flat"
                required
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                defaultValue=""
              >
                <option value="" disabled>
                  Select flat…
                </option>
                {flats.map((flat) => (
                  <option key={flat.id} value={flat.id}>
                    Flat {flat.flatNumber} — {flat.residentName}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="pay-amount" className="text-sm font-medium">
                Amount (₹)
              </label>
              <Input id="pay-amount" type="number" min={1} defaultValue={1300} required />
            </div>
            <div className="space-y-2">
              <label htmlFor="pay-period" className="text-sm font-medium">
                Billing period
              </label>
              <Input id="pay-period" defaultValue="July 2025" required />
            </div>
            <div className="space-y-2">
              <label htmlFor="pay-mode" className="text-sm font-medium">
                Payment mode
              </label>
              <select
                id="pay-mode"
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                defaultValue="cash"
              >
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="cheque">Cheque</option>
                <option value="bank">Bank transfer</option>
              </select>
            </div>
            <Button type="submit" className="w-full">
              Record payment
            </Button>
          </form>
        )}
      </SheetContent>
    </Sheet>
  );
}

function PublishNoticeDrawer({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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
          <SheetTitle>Publish notice</SheetTitle>
          <SheetDescription>
            Create and publish a society-wide announcement to all residents.
          </SheetDescription>
        </SheetHeader>

        {submitted ? (
          <div className="mt-6">
            <DemoSuccessBanner
              message="Notice published to all residents."
              onDismiss={() => handleClose(false)}
            />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <label htmlFor="notice-title" className="text-sm font-medium">
                Title
              </label>
              <Input id="notice-title" placeholder="Notice title" required />
            </div>
            <div className="space-y-2">
              <label htmlFor="notice-category" className="text-sm font-medium">
                Category
              </label>
              <select
                id="notice-category"
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                defaultValue="general"
              >
                <option value="general">General</option>
                <option value="maintenance">Maintenance</option>
                <option value="event">Event</option>
                <option value="emergency">Emergency</option>
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="notice-body" className="text-sm font-medium">
                Message
              </label>
              <textarea
                id="notice-body"
                required
                rows={5}
                placeholder="Write the announcement…"
                className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <Button type="submit" className="w-full">
              Publish notice
            </Button>
          </form>
        )}
      </SheetContent>
    </Sheet>
  );
}

function ScheduleServiceDrawer({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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
          <SheetTitle>Schedule service</SheetTitle>
          <SheetDescription>
            Book a vendor visit for society maintenance or a flat-specific service.
          </SheetDescription>
        </SheetHeader>

        {submitted ? (
          <div className="mt-6">
            <DemoSuccessBanner
              message="Service visit scheduled."
              onDismiss={() => handleClose(false)}
            />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <label htmlFor="svc-title" className="text-sm font-medium">
                Service title
              </label>
              <Input id="svc-title" placeholder="e.g. Lift maintenance" required />
            </div>
            <div className="space-y-2">
              <label htmlFor="svc-vendor" className="text-sm font-medium">
                Vendor
              </label>
              <Input id="svc-vendor" placeholder="Vendor name" required />
            </div>
            <div className="space-y-2">
              <label htmlFor="svc-date" className="text-sm font-medium">
                Scheduled date
              </label>
              <Input id="svc-date" type="date" defaultValue="2025-07-10" required />
            </div>
            <Button type="submit" className="w-full">
              Schedule service
            </Button>
          </form>
        )}
      </SheetContent>
    </Sheet>
  );
}
