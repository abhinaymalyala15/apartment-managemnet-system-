"use client";

import { useMemo } from "react";
import { NoticeWorkspace } from "@/components/inspector/communication/notice-workspace";
import { useCommunicationActions } from "@/components/inspector/communication/communication-provider";
import { getScheduledNotices } from "@/lib/communication-data";

export function ScheduledNoticesWorkspace() {
  const { noticesVersion } = useCommunicationActions();

  const items = useMemo(
    () =>
      getScheduledNotices().map((notice) => ({
        ...notice,
        kind: "scheduled" as const,
      })),
    [noticesVersion]
  );

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Notices queued for future publishing.
      </p>
      <NoticeWorkspace items={items} searchPlaceholder="Search scheduled notices…" />
    </div>
  );
}
