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
import { useFinanceActions } from "@/components/inspector/finance/finance-provider";
import { buildStatementPreview } from "@/lib/finance-data";
import { getBlocks, getResidentTableRows } from "@/lib/data";

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

export function FinanceDrawers() {
  const { activeAction, actionContext, closeAction } = useFinanceActions();

  return (
    <>
      <RecordPaymentDrawer
        open={activeAction === "record-payment"}
        onOpenChange={(o) => !o && closeAction()}
        flatId={actionContext.flatId}
        flatNumber={actionContext.flatNumber}
      />
      <LogFollowUpDrawer
        open={activeAction === "log-follow-up"}
        onOpenChange={(o) => !o && closeAction()}
        flatNumber={actionContext.flatNumber}
      />
      <ReceiptDrawer
        open={
          activeAction === "generate-receipt" ||
          activeAction === "print-receipt" ||
          activeAction === "download-receipt"
        }
        onOpenChange={(o) => !o && closeAction()}
        mode={
          activeAction === "print-receipt"
            ? "print"
            : activeAction === "download-receipt"
              ? "download"
              : "view"
        }
        receiptNumber={actionContext.receiptNumber}
        flatNumber={actionContext.flatNumber}
      />
      <StatementDrawer
        open={activeAction === "generate-statement"}
        onOpenChange={(o) => !o && closeAction()}
        flatId={actionContext.flatId}
        flatNumber={actionContext.flatNumber}
      />
    </>
  );
}

function RecordPaymentDrawer({
  open,
  onOpenChange,
  flatId,
  flatNumber,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  flatId?: string;
  flatNumber?: string;
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
      <SheetContent className="overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Record payment</SheetTitle>
          <SheetDescription>
            {flatNumber
              ? `Log payment for Flat ${flatNumber}`
              : "Select flat and enter payment details"}
          </SheetDescription>
        </SheetHeader>
        {submitted ? (
          <div className="mt-6">
            <DemoBanner
              message="Payment recorded. Receipt ready to generate."
              onDismiss={() => handleClose(false)}
            />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <label htmlFor="fp-flat" className="text-sm font-medium">
                Flat
              </label>
              <select
                id="fp-flat"
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                defaultValue={flatId ?? flats[0]?.id}
                required
              >
                {flats.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.flatNumber} — {f.residentName}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="fp-amount" className="text-sm font-medium">
                Amount (₹)
              </label>
              <Input id="fp-amount" type="number" defaultValue="1300" required />
            </div>
            <div className="space-y-2">
              <label htmlFor="fp-period" className="text-sm font-medium">
                Period
              </label>
              <Input id="fp-period" defaultValue="July 2025" required />
            </div>
            <div className="space-y-2">
              <label htmlFor="fp-mode" className="text-sm font-medium">
                Mode
              </label>
              <select
                id="fp-mode"
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
              >
                <option>Cash</option>
                <option>UPI</option>
                <option>Cheque</option>
                <option>Bank transfer</option>
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

function LogFollowUpDrawer({
  open,
  onOpenChange,
  flatNumber,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  flatNumber?: string;
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
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Log follow-up</SheetTitle>
          <SheetDescription>
            {flatNumber ? `Flat ${flatNumber}` : "Record contact outcome"}
          </SheetDescription>
        </SheetHeader>
        {submitted ? (
          <div className="mt-6">
            <DemoBanner
              message="Follow-up logged. Timeline updated."
              onDismiss={() => handleClose(false)}
            />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Contact method</label>
              <select className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm">
                <option>Phone</option>
                <option>WhatsApp</option>
                <option>SMS</option>
                <option>Email</option>
                <option>In person</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Outcome</label>
              <textarea
                rows={3}
                className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                placeholder="Resident promised payment by…"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Next follow-up</label>
              <Input type="date" defaultValue="2025-07-07" required />
            </div>
            <Button type="submit" className="w-full">
              Save follow-up
            </Button>
          </form>
        )}
      </SheetContent>
    </Sheet>
  );
}

function ReceiptDrawer({
  open,
  onOpenChange,
  mode,
  receiptNumber,
  flatNumber,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "view" | "print" | "download";
  receiptNumber?: string;
  flatNumber?: string;
}) {
  const receiptText = [
    "Sylvan Shelter Apartment — Maintenance Receipt",
    "",
    `Flat: ${flatNumber ?? "—"}`,
    `Receipt: ${receiptNumber ?? "RCP-2025-0702"}`,
    "Period: July 2025",
    "Amount: ₹1,300",
    "Mode: UPI",
    "Date: 2 Jul 2025",
  ].join("\n");

  function handlePrint() {
    const w = window.open("", "_blank");
    if (w) {
      w.document.write(`<pre>${receiptText}</pre>`);
      w.document.close();
      w.print();
    }
  }

  function handleDownload() {
    const blob = new Blob([receiptText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `receipt-${flatNumber ?? "flat"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>
            {mode === "print" ? "Print receipt" : mode === "download" ? "Download receipt" : "Receipt"}
          </SheetTitle>
          <SheetDescription>
            Flat {flatNumber ?? "—"} · {receiptNumber ?? "Demo receipt"}
          </SheetDescription>
        </SheetHeader>
        <pre className="mt-6 whitespace-pre-wrap rounded-lg border bg-muted/30 p-4 text-sm">
          {receiptText}
        </pre>
        <div className="mt-4 flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            Print
          </Button>
          <Button variant="outline" onClick={handleDownload}>
            Download
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function StatementDrawer({
  open,
  onOpenChange,
  flatId,
  flatNumber,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  flatId?: string;
  flatNumber?: string;
}) {
  const blocks = getBlocks();
  const [scope, setScope] = useState<"flat" | "block" | "apartment">(
    flatId ? "flat" : "apartment"
  );
  const [blockId, setBlockId] = useState(blocks[0]?.id ?? "block-a");
  const [dateFrom, setDateFrom] = useState("2025-01-01");
  const [dateTo, setDateTo] = useState("2025-07-02");

  const preview = buildStatementPreview({
    scope,
    flatId: flatId ?? undefined,
    blockId,
    dateFrom,
    dateTo,
  });

  function handlePrint() {
    const w = window.open("", "_blank");
    if (w) {
      w.document.write(`<pre>${preview}</pre>`);
      w.document.close();
      w.print();
    }
  }

  function handleDownload() {
    const blob = new Blob([preview], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `statement-${scope}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Generate statement</SheetTitle>
          <SheetDescription>
            Flat, block, or whole apartment · date range
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Scope</label>
            <select
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
              value={scope}
              onChange={(e) => setScope(e.target.value as typeof scope)}
            >
              <option value="apartment">Whole apartment</option>
              <option value="block">Block</option>
              <option value="flat">Flat</option>
            </select>
          </div>
          {scope === "block" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Block</label>
              <select
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                value={blockId}
                onChange={(e) => setBlockId(e.target.value)}
              >
                {blocks.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          {scope === "flat" && flatNumber && (
            <p className="text-sm text-muted-foreground">Flat {flatNumber}</p>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">From</label>
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">To</label>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
          </div>
          <pre className="whitespace-pre-wrap rounded-lg border bg-muted/30 p-4 text-sm">
            {preview}
          </pre>
          <div className="flex gap-2">
            <Button onClick={handlePrint}>Print</Button>
            <Button variant="outline" onClick={handleDownload}>
              Download
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
