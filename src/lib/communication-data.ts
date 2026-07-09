/**
 * Communication module data layer (Phase 7F).
 */
import noticeDraftsData from "@/data/notice-drafts.json";
import noticeArchivedData from "@/data/notice-archived.json";
import noticeScheduledData from "@/data/notice-scheduled.json";
import noticeHistoryData from "@/data/notice-history.json";

import type {
  ArchivedNotice,
  CommunicationSummary,
  Notice,
  NoticeDraft,
  NoticeHistoryEvent,
  ScheduledNotice,
} from "@/types";

import { getBlocks, getNotices, getDemoToday, getDemoTodayIso } from "@/lib/data";
import { formatDateTime } from "@/lib/admin-data";
import { listStoredDrafts } from "@/lib/communication-storage";

const drafts = noticeDraftsData as NoticeDraft[];
const archived = noticeArchivedData as ArchivedNotice[];
const scheduled = noticeScheduledData as ScheduledNotice[];
const history = noticeHistoryData as NoticeHistoryEvent[];

export function getNoticeDrafts(): NoticeDraft[] {
  const merged = [...listStoredDrafts(), ...drafts];
  const seen = new Set<string>();
  const unique = merged.filter((d) => {
    if (seen.has(d.id)) return false;
    seen.add(d.id);
    return true;
  });
  return unique.sort(
    (a, b) =>
      new Date(b.lastEditedAt).getTime() - new Date(a.lastEditedAt).getTime()
  );
}

export function getArchivedNotices(): ArchivedNotice[] {
  return [...archived].sort(
    (a, b) =>
      new Date(b.archivedAt).getTime() - new Date(a.archivedAt).getTime()
  );
}

export function getScheduledNotices(): ScheduledNotice[] {
  return [...scheduled].sort(
    (a, b) =>
      new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
  );
}

export function getNoticeHistory(): NoticeHistoryEvent[] {
  return [...history].sort(
    (a, b) =>
      new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
  );
}

export function getPublishedNotices(): Notice[] {
  return getNotices().sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

export type NoticePeriodFilter = "all" | "week" | "month";

export function getPublishedNoticesForPeriod(
  period: NoticePeriodFilter = "all"
): Notice[] {
  const all = getPublishedNotices();
  if (period === "all") return all;

  const today = getDemoToday();
  const todayIso = getDemoTodayIso();
  const monthPrefix = todayIso.slice(0, 7);

  if (period === "month") {
    return all.filter((n) => n.publishedAt.startsWith(monthPrefix));
  }

  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - weekStart.getDay());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  const weekStartIso = weekStart.toISOString().slice(0, 10);
  const weekEndIso = weekEnd.toISOString().slice(0, 10);

  return all.filter(
    (n) => n.publishedAt >= weekStartIso && n.publishedAt <= weekEndIso
  );
}

export function getCommunicationSummary(): CommunicationSummary {
  const published = getPublishedNotices();
  const allDrafts = getNoticeDrafts();
  return {
    publishedCount: published.length,
    draftCount: allDrafts.length,
    scheduledCount: scheduled.length,
    archivedCount: archived.length,
    emergencyCount: published.filter((n) => n.isEmergency || n.category === "emergency").length,
    recentPublished: published.slice(0, 5),
    upcomingScheduled: scheduled,
  };
}

export function getNoticeAudienceLabel(
  audience: Notice["audience"] = "all",
  blockIds?: string[]
): string {
  if (audience === "all") return "All residents";
  if (audience === "owners") return "Owners only";
  if (audience === "tenants") return "Tenants only";
  if (audience === "block" && blockIds?.length) {
    const names = blockIds
      .map((id) => getBlocks().find((b) => b.id === id)?.name)
      .filter(Boolean);
    return names.length ? names.join(", ") : "Selected block(s)";
  }
  return "Selected block(s)";
}

export function getNoticeHistoryActionLabel(
  action: NoticeHistoryEvent["action"]
): string {
  const labels: Record<NoticeHistoryEvent["action"], string> = {
    created: "Created draft",
    edited: "Edited",
    published: "Published",
    scheduled: "Scheduled",
    archived: "Archived",
    emergency_sent: "Emergency sent",
  };
  return labels[action];
}

export { formatDateTime };
