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
import { useCommunicationActions } from "@/components/inspector/communication/communication-provider";
import { getBlocks } from "@/lib/data";

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
        Demo mode — notice would appear in resident app and timeline on save.
      </p>
      <Button size="sm" variant="outline" className="mt-3" onClick={onDismiss}>
        Close
      </Button>
    </div>
  );
}

export function CommunicationDrawers() {
  const { activeAction, actionContext, closeAction } = useCommunicationActions();

  const isCompose =
    activeAction === "compose" ||
    activeAction === "edit-draft" ||
    activeAction === "publish" ||
    activeAction === "schedule" ||
    activeAction === "emergency";

  return (
    <>
      <NoticeComposeDrawer
        open={isCompose}
        onOpenChange={(o) => !o && closeAction()}
        mode={activeAction ?? "compose"}
        defaultTitle={actionContext.title}
      />
      <ArchiveConfirmDrawer
        open={activeAction === "archive"}
        onOpenChange={(o) => !o && closeAction()}
        noticeId={actionContext.noticeId}
      />
    </>
  );
}

function NoticeComposeDrawer({
  open,
  onOpenChange,
  mode,
  defaultTitle,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: string;
  defaultTitle?: string;
}) {
  const [submitted, setSubmitted] = useState(false);
  const blocks = getBlocks();
  const isEmergency = mode === "emergency";
  const isSchedule = mode === "schedule";

  const titles: Record<string, string> = {
    compose: "Create notice",
    "edit-draft": "Edit draft",
    publish: "Publish notice",
    schedule: "Schedule notice",
    emergency: "Emergency notice",
  };

  const successMessages: Record<string, string> = {
    compose: "Draft saved.",
    "edit-draft": "Draft updated.",
    publish: "Notice published to residents.",
    schedule: "Notice scheduled for publishing.",
    emergency: "Emergency alert sent to all residents.",
  };

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
      <SheetContent className="overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{titles[mode] ?? "Notice"}</SheetTitle>
          <SheetDescription>
            {isEmergency
              ? "High-priority alert — sent immediately to all residents."
              : "Compose, target audience, and publish or schedule."}
          </SheetDescription>
        </SheetHeader>

        {submitted ? (
          <div className="mt-6">
            <DemoBanner
              message={successMessages[mode] ?? "Saved."}
              onDismiss={() => handleClose(false)}
            />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                defaultValue={defaultTitle}
                placeholder="Notice title"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Message</label>
              <textarea
                rows={5}
                required
                placeholder="Write the announcement…"
                className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <select
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                  defaultValue={isEmergency ? "emergency" : "general"}
                >
                  <option value="general">General</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="event">Event</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
                <select
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                  defaultValue={isEmergency ? "high" : "medium"}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Audience</label>
              <select
                id="audience"
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                defaultValue={isEmergency ? "all" : "all"}
              >
                <option value="all">All residents</option>
                <option value="owners">Owners only</option>
                <option value="tenants">Tenants only</option>
                <option value="block">Specific block(s)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Block (if targeted)</label>
              <select
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                defaultValue={blocks[0]?.id}
              >
                {blocks.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            {(isSchedule || mode === "compose") && (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {isSchedule ? "Publish at" : "Schedule (optional)"}
                </label>
                <Input
                  type="datetime-local"
                  defaultValue="2025-07-10T09:00"
                />
              </div>
            )}
            <div className="flex flex-wrap gap-2 pt-2">
              {mode === "compose" && (
                <>
                  <Button type="submit" variant="outline">
                    Save draft
                  </Button>
                  <Button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      handleSubmit(e as unknown as React.FormEvent);
                    }}
                  >
                    Publish now
                  </Button>
                </>
              )}
              {mode === "edit-draft" && (
                <Button type="submit">Save draft</Button>
              )}
              {mode === "publish" && (
                <Button type="submit">Publish</Button>
              )}
              {mode === "schedule" && (
                <Button type="submit">Schedule</Button>
              )}
              {mode === "emergency" && (
                <Button type="submit" variant="destructive">
                  Send emergency alert
                </Button>
              )}
            </div>
          </form>
        )}
      </SheetContent>
    </Sheet>
  );
}

function ArchiveConfirmDrawer({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  noticeId?: string;
}) {
  const [done, setDone] = useState(false);

  function handleClose(next: boolean) {
    if (!next) setDone(false);
    onOpenChange(next);
  }

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Archive notice</SheetTitle>
          <SheetDescription>
            Move this notice out of the published list. Residents will no longer
            see it in the active feed.
          </SheetDescription>
        </SheetHeader>
        {done ? (
          <div className="mt-6">
            <DemoBanner
              message="Notice archived."
              onDismiss={() => handleClose(false)}
            />
          </div>
        ) : (
          <div className="mt-6 flex gap-2">
            <Button variant="outline" onClick={() => handleClose(false)}>
              Cancel
            </Button>
            <Button onClick={() => setDone(true)}>Archive</Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
