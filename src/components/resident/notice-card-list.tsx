"use client";

import { useState } from "react";
import { Calendar, Megaphone, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  formatDate,
  getNoticeCategoryLabel,
  getNoticePriorityLabel,
} from "@/lib/data";
import type { Notice } from "@/types";
import { cn } from "@/lib/utils";

interface NoticeCardListProps {
  notices: Notice[];
  expandable?: boolean;
}

export function NoticeCardList({
  notices,
  expandable = false,
}: NoticeCardListProps) {
  return (
    <div className="space-y-3">
      {notices.map((notice) => (
        <NoticeCard key={notice.id} notice={notice} expandable={expandable} />
      ))}
    </div>
  );
}

function NoticeCard({
  notice,
  expandable,
}: {
  notice: Notice;
  expandable: boolean;
}) {
  const [expanded, setExpanded] = useState(!expandable);
  const isLong = notice.content.length > 180;
  const showToggle = expandable && isLong;

  return (
    <article
      className={cn(
        "surface-card overflow-hidden",
        notice.priority === "high" && "border-warning",
        notice.category === "emergency" && "border-destructive/40"
      )}
    >
      <div className="p-4">
        <div className="flex flex-wrap items-start gap-2">
          <Megaphone className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-medium leading-snug">{notice.title}</h3>
              <Badge variant="outline" className="text-[10px]">
                {getNoticeCategoryLabel(notice.category)}
              </Badge>
              {notice.priority !== "low" && (
                <Badge
                  variant={notice.priority === "high" ? "destructive" : "secondary"}
                  className="text-[10px]"
                >
                  {getNoticePriorityLabel(notice.priority)}
                </Badge>
              )}
            </div>
            <p
              className={cn(
                "mt-2 text-sm leading-relaxed text-muted-foreground",
                !expanded && showToggle && "line-clamp-3"
              )}
            >
              {notice.content}
            </p>
            {showToggle && (
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                {expanded ? "Show less" : "Read more"}
                <ChevronDown
                  className={cn("h-3 w-3 transition-transform", expanded && "rotate-180")}
                />
              </button>
            )}
            <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(notice.publishedAt)}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
