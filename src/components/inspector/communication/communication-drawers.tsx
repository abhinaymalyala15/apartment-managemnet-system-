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
import {
  useCommunicationActions,
  type CommunicationAction,
} from "@/components/inspector/communication/communication-provider";
import { getBlocks } from "@/lib/data";
import {
  addStoredPublished,
  createDraftFromForm,
  publishDraftAsNotice,
  upsertStoredDraft,
} from "@/lib/communication-storage";
import type { Notice } from "@/types";

function SuccessBanner({
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
        Saved locally — visible in this workspace and the resident notices feed.
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
  mode: CommunicationAction | string;
  defaultTitle?: string;
}) {
  const { refreshNotices } = useCommunicationActions();
  const [submitted, setSubmitted] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [title, setTitle] = useState(defaultTitle ?? "");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<Notice["category"]>("general");
  const [priority, setPriority] = useState<Notice["priority"]>("medium");
  const [audience, setAudience] = useState<Notice["audience"]>("all");
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

  function resetForm() {
    setSubmitted(false);
    setSuccessMessage("");
    setTitle(defaultTitle ?? "");
    setContent("");
    setCategory(isEmergency ? "emergency" : "general");
    setPriority(isEmergency ? "high" : "medium");
    setAudience("all");
  }

  function handleClose(next: boolean) {
    if (!next) resetForm();
    onOpenChange(next);
  }

  function saveDraft() {
    const draft = createDraftFromForm({
      title,
      content,
      category,
      priority,
      audience,
      isEmergency: category === "emergency",
    });
    upsertStoredDraft(draft);
    refreshNotices();
    setSuccessMessage("Draft saved.");
    setSubmitted(true);
  }

  function publishNow() {
    const draft = createDraftFromForm({
      title,
      content,
      category: isEmergency ? "emergency" : category,
      priority: isEmergency ? "high" : priority,
      audience,
      isEmergency: isEmergency || category === "emergency",
    });
    const notice = publishDraftAsNotice(draft);
    addStoredPublished(notice);
    refreshNotices();
    setSuccessMessage(
      isEmergency
        ? "Emergency alert sent to all residents."
        : "Notice published to residents."
    );
    setSubmitted(true);
  }

  function handleSubmit(e: React.FormEvent, intent: "draft" | "publish" | "schedule") {
    e.preventDefault();
    if (intent === "draft") {
      saveDraft();
      return;
    }
    if (intent === "publish" || isEmergency || mode === "publish" || mode === "emergency") {
      publishNow();
      return;
    }
    saveDraft();
    setSuccessMessage("Notice scheduled for publishing.");
    setSubmitted(true);
    refreshNotices();
  }

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent className="overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{titles[mode] ?? "Notice"}</SheetTitle>
          <SheetDescription>
            {isEmergency
              ? "High-priority alert — sent immediately to all residents."
              : "Compose, target audience, and publish or save as draft."}
          </SheetDescription>
        </SheetHeader>

        {submitted ? (
          <div className="mt-6">
            <SuccessBanner
              message={successMessage || "Saved."}
              onDismiss={() => handleClose(false)}
            />
          </div>
        ) : (
          <form
            onSubmit={(e) => handleSubmit(e, "draft")}
            className="mt-6 space-y-4"
          >
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Notice title"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Message</label>
              <textarea
                rows={5}
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write the announcement…"
                className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <select
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value as Notice["category"])
                  }
                  disabled={isEmergency}
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
                  value={priority}
                  onChange={(e) =>
                    setPriority(e.target.value as Notice["priority"])
                  }
                  disabled={isEmergency}
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
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                value={audience}
                onChange={(e) =>
                  setAudience(e.target.value as Notice["audience"])
                }
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
                <Input type="datetime-local" defaultValue="2025-07-10T09:00" />
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
                    onClick={(e) => handleSubmit(e, "publish")}
                  >
                    Publish now
                  </Button>
                </>
              )}
              {mode === "edit-draft" && (
                <Button type="submit">Save draft</Button>
              )}
              {mode === "publish" && (
                <Button type="button" onClick={(e) => handleSubmit(e, "publish")}>
                  Publish
                </Button>
              )}
              {mode === "schedule" && (
                <Button type="button" onClick={(e) => handleSubmit(e, "schedule")}>
                  Schedule
                </Button>
              )}
              {mode === "emergency" && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={(e) => handleSubmit(e, "publish")}
                >
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
            <SuccessBanner
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
