"use client";

import { Megaphone, AlertTriangle, Calendar, Archive } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  formatDate,
  getNoticeCategoryLabel,
  getNoticePriorityLabel,
} from "@/lib/data";
import {
  formatDateTime,
  getNoticeAudienceLabel,
} from "@/lib/communication-data";
import { useCommunicationActions } from "@/components/inspector/communication/communication-provider";
import type { ArchivedNotice, Notice, NoticeDraft, ScheduledNotice } from "@/types";
import { cn } from "@/lib/utils";

type NoticeItem =
  | (Notice & { kind: "published" })
  | (NoticeDraft & { kind: "draft" })
  | (ScheduledNotice & { kind: "scheduled" })
  | (ArchivedNotice & { kind: "archived" });

interface NoticeAdminListProps {
  items: NoticeItem[];
  showActions?: boolean;
}

export function NoticeAdminList({ items, showActions = true }: NoticeAdminListProps) {
  const { openAction } = useCommunicationActions();

  if (items.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No notices in this view.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li
          key={item.id}
          className={cn(
            "surface-card p-4 sm:p-5",
            item.priority === "high" && "border-warning/50",
            (item.kind === "published" || item.kind === "archived") &&
              (item.category === "emergency" || ("isEmergency" in item && item.isEmergency)) &&
              "border-destructive/40 bg-destructive/5"
          )}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Megaphone className="h-4 w-4 shrink-0 text-muted-foreground" />
                <h3 className="font-semibold leading-snug">{item.title}</h3>
                <Badge variant="outline" className="text-[10px]">
                  {getNoticeCategoryLabel(item.category)}
                </Badge>
                {item.priority !== "low" && (
                  <Badge
                    variant={item.priority === "high" ? "destructive" : "secondary"}
                    className="text-[10px]"
                  >
                    {getNoticePriorityLabel(item.priority)}
                  </Badge>
                )}
                {"isEmergency" in item && item.isEmergency && (
                  <Badge variant="destructive" className="gap-1 text-[10px]">
                    <AlertTriangle className="h-3 w-3" />
                    Emergency
                  </Badge>
                )}
                <KindBadge kind={item.kind} />
              </div>
              {"content" in item && item.content && (
                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                  {item.content}
                </p>
              )}
              <dl className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                {"audience" in item && item.audience && (
                  <div>
                    <span className="font-medium text-foreground">Audience: </span>
                    {getNoticeAudienceLabel(item.audience, item.blockIds)}
                  </div>
                )}
                {"author" in item && item.author && (
                  <div>
                    <span className="font-medium text-foreground">By: </span>
                    {item.author}
                  </div>
                )}
                {item.kind === "published" && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Published {formatDate(item.publishedAt)}
                  </div>
                )}
                {item.kind === "draft" && (
                  <div>Edited {formatDateTime(item.lastEditedAt)}</div>
                )}
                {item.kind === "scheduled" && (
                  <div>Scheduled {formatDateTime(item.scheduledAt)}</div>
                )}
                {item.kind === "archived" && (
                  <div className="flex items-center gap-1">
                    <Archive className="h-3 w-3" />
                    Archived {formatDate(item.archivedAt)}
                  </div>
                )}
              </dl>
            </div>
            {showActions && (
              <div className="flex shrink-0 flex-wrap gap-2">
                {item.kind === "draft" && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        openAction("edit-draft", { draftId: item.id, title: item.title })
                      }
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      onClick={() =>
                        openAction("publish", { draftId: item.id, title: item.title })
                      }
                    >
                      Publish
                    </Button>
                  </>
                )}
                {item.kind === "scheduled" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openAction("publish", { noticeId: item.id })}
                  >
                    Publish now
                  </Button>
                )}
                {item.kind === "published" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openAction("archive", { noticeId: item.id })}
                  >
                    Archive
                  </Button>
                )}
              </div>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

function KindBadge({ kind }: { kind: NoticeItem["kind"] }) {
  const labels = {
    published: "Published",
    draft: "Draft",
    scheduled: "Scheduled",
    archived: "Archived",
  };
  return (
    <Badge variant="secondary" className="text-[10px]">
      {labels[kind]}
    </Badge>
  );
}

export type { NoticeItem };
