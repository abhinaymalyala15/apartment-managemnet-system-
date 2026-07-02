"use client";

import { useMemo, useState } from "react";
import { ListToolbar } from "@/components/ui/list-toolbar";
import {
  formatDateTime,
  getNoticeHistory,
  getNoticeHistoryActionLabel,
} from "@/lib/communication-data";
import type { NoticeHistoryEvent } from "@/types";
import { Badge } from "@/components/ui/badge";

export function NoticeHistoryWorkspace() {
  const allEvents = getNoticeHistory();
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");

  const filtered = useMemo(() => {
    let list = allEvents;
    if (actionFilter !== "all") {
      list = list.filter((e) => e.action === actionFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) =>
          e.noticeTitle.toLowerCase().includes(q) ||
          e.actor.toLowerCase().includes(q)
      );
    }
    return list;
  }, [allEvents, search, actionFilter]);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Audit trail of notice lifecycle — create, edit, publish, schedule, archive,
        and emergency sends.
      </p>
      <ListToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search title or staff…"
        filters={[
          {
            id: "action",
            value: actionFilter,
            onChange: setActionFilter,
            placeholder: "Action",
            options: [
              { value: "all", label: "All actions" },
              { value: "published", label: "Published" },
              { value: "scheduled", label: "Scheduled" },
              { value: "archived", label: "Archived" },
              { value: "emergency_sent", label: "Emergency" },
              { value: "edited", label: "Edited" },
              { value: "created", label: "Created" },
            ],
          },
        ]}
        resultCount={{ shown: filtered.length, total: allEvents.length }}
      />
      <ul className="surface-card divide-y">
        {filtered.map((event) => (
          <HistoryRow key={event.id} event={event} />
        ))}
      </ul>
    </div>
  );
}

function HistoryRow({ event }: { event: NoticeHistoryEvent }) {
  return (
    <li className="px-4 py-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-medium">{event.noticeTitle}</p>
          <p className="text-sm text-muted-foreground">
            {event.actor} · {formatDateTime(event.occurredAt)}
          </p>
          {event.detail && (
            <p className="mt-1 text-xs text-muted-foreground">{event.detail}</p>
          )}
        </div>
        <ActionBadge action={event.action} />
      </div>
    </li>
  );
}

function ActionBadge({ action }: { action: NoticeHistoryEvent["action"] }) {
  const variant =
    action === "emergency_sent"
      ? "destructive"
      : action === "published"
        ? "default"
        : "outline";
  return (
    <Badge variant={variant} className="shrink-0 text-[10px]">
      {getNoticeHistoryActionLabel(action)}
    </Badge>
  );
}
