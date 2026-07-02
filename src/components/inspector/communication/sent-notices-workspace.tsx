"use client";

import { useMemo, useState } from "react";
import { Megaphone, AlertTriangle } from "lucide-react";
import { ListToolbar } from "@/components/ui/list-toolbar";
import { Badge } from "@/components/ui/badge";
import {
  getNoticeCategoryLabel,
  getNoticePriorityLabel,
  formatDate,
} from "@/lib/data";
import {
  getPublishedNoticesForPeriod,
  getNoticeAudienceLabel,
  type NoticePeriodFilter,
} from "@/lib/communication-data";
import type { Notice } from "@/types";
import { cn } from "@/lib/utils";

const PERIOD_OPTIONS = [
  { value: "all", label: "All" },
  { value: "week", label: "This week" },
  { value: "month", label: "This month" },
] as const;

export function SentNoticesWorkspace() {
  const [periodFilter, setPeriodFilter] = useState<NoticePeriodFilter>("all");
  const [search, setSearch] = useState("");

  const periodBase = useMemo(
    () => getPublishedNoticesForPeriod(periodFilter),
    [periodFilter]
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return periodBase;
    const q = search.toLowerCase();
    return periodBase.filter(
      (notice) =>
        notice.title.toLowerCase().includes(q) ||
        notice.content.toLowerCase().includes(q) ||
        notice.author?.toLowerCase().includes(q) ||
        getNoticeCategoryLabel(notice.category).toLowerCase().includes(q)
    );
  }, [periodBase, search]);

  return (
    <div className="space-y-4">
      <ListToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search notice title or content…"
        filters={[
          {
            id: "period",
            value: periodFilter,
            onChange: (v) => setPeriodFilter(v as NoticePeriodFilter),
            placeholder: "Period",
            options: [...PERIOD_OPTIONS],
          },
        ]}
        resultCount={{ shown: filtered.length, total: periodBase.length }}
      />

      {filtered.length === 0 ? (
        <div className="surface-card px-4 py-8 text-center text-sm text-muted-foreground">
          No notices sent to residents for this period
        </div>
      ) : (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Sent to residents
          </h2>
          <ul className="surface-card divide-y">
            {filtered.map((notice) => (
              <SentNoticeRow key={notice.id} notice={notice} />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function SentNoticeRow({ notice }: { notice: Notice }) {
  const isEmergency =
    notice.category === "emergency" || notice.isEmergency === true;

  return (
    <li>
      <article
        className={cn(
          "px-4 py-4",
          isEmergency && "bg-destructive/5"
        )}
      >
        <div className="flex flex-wrap items-start gap-2">
          <Megaphone className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold leading-snug">{notice.title}</h3>
            <div className="mt-2 flex flex-wrap items-center gap-2">
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
              {isEmergency && (
                <Badge variant="destructive" className="gap-1 text-[10px]">
                  <AlertTriangle className="h-3 w-3" />
                  Emergency
                </Badge>
              )}
            </div>
          </div>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {notice.content}
        </p>

        <dl className="mt-3 grid gap-1 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Sent on
            </dt>
            <dd className="mt-0.5 font-medium">{formatDate(notice.publishedAt)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Sent to
            </dt>
            <dd className="mt-0.5 font-medium">
              {getNoticeAudienceLabel(notice.audience, notice.blockIds)}
            </dd>
          </div>
          {notice.author && (
            <div className="sm:col-span-2">
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Published by
              </dt>
              <dd className="mt-0.5 font-medium">{notice.author}</dd>
            </div>
          )}
        </dl>
      </article>
    </li>
  );
}
