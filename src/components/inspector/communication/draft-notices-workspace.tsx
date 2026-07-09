"use client";

import { useMemo } from "react";
import { Plus } from "lucide-react";
import { NoticeWorkspace } from "@/components/inspector/communication/notice-workspace";
import { useCommunicationActions } from "@/components/inspector/communication/communication-provider";
import { Button } from "@/components/ui/button";
import { getNoticeDrafts } from "@/lib/communication-data";

export function DraftNoticesWorkspace() {
  const { noticesVersion, openAction } = useCommunicationActions();

  const items = useMemo(
    () => getNoticeDrafts().map((draft) => ({ ...draft, kind: "draft" as const })),
    [noticesVersion]
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Drafts are saved locally and can be edited before publishing.
        </p>
        <Button type="button" size="sm" onClick={() => openAction("compose")}>
          <Plus className="h-4 w-4" />
          New draft
        </Button>
      </div>
      <NoticeWorkspace items={items} searchPlaceholder="Search drafts…" />
    </div>
  );
}
