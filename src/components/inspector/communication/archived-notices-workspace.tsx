"use client";

import { useMemo } from "react";
import { NoticeWorkspace } from "@/components/inspector/communication/notice-workspace";
import { useCommunicationActions } from "@/components/inspector/communication/communication-provider";
import { getArchivedNotices } from "@/lib/communication-data";

export function ArchivedNoticesWorkspace() {
  const { noticesVersion } = useCommunicationActions();

  const items = useMemo(
    () =>
      getArchivedNotices().map((notice) => ({
        ...notice,
        kind: "archived" as const,
      })),
    [noticesVersion]
  );

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Archived notices are hidden from the resident feed.
      </p>
      <NoticeWorkspace items={items} searchPlaceholder="Search archived notices…" />
    </div>
  );
}
