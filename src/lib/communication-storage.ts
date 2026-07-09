/**
 * Client-side notice drafts & published overlays (Inspector demo).
 */

import type { Notice, NoticeDraft } from "@/types";

const DRAFTS_KEY = "apartmenterp.notice-drafts.v1";
const PUBLISHED_KEY = "apartmenterp.notice-published.v1";

function readJson<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as T[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeJson<T>(key: string, value: T[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function listStoredDrafts(): NoticeDraft[] {
  return readJson<NoticeDraft>(DRAFTS_KEY);
}

export function upsertStoredDraft(draft: NoticeDraft): NoticeDraft {
  const all = listStoredDrafts();
  const idx = all.findIndex((d) => d.id === draft.id);
  if (idx >= 0) all[idx] = draft;
  else all.unshift(draft);
  writeJson(DRAFTS_KEY, all);
  return draft;
}

export function removeStoredDraft(id: string): void {
  writeJson(
    DRAFTS_KEY,
    listStoredDrafts().filter((d) => d.id !== id)
  );
}

export function listStoredPublished(): Notice[] {
  return readJson<Notice>(PUBLISHED_KEY);
}

export function addStoredPublished(notice: Notice): Notice {
  const all = [notice, ...listStoredPublished()];
  writeJson(PUBLISHED_KEY, all);
  return notice;
}

export function createDraftFromForm(input: {
  title: string;
  content: string;
  category: Notice["category"];
  priority: Notice["priority"];
  audience?: Notice["audience"];
  isEmergency?: boolean;
}): NoticeDraft {
  const now = new Date().toISOString();
  return {
    id: `draft-${Date.now().toString(36)}`,
    apartmentId: "apt-sylvan-shelter",
    title: input.title.trim(),
    content: input.content.trim(),
    category: input.category,
    priority: input.priority,
    audience: input.audience ?? "all",
    author: "Apartment Inspector",
    lastEditedAt: now,
    isEmergency: input.isEmergency,
  };
}

export function publishDraftAsNotice(draft: NoticeDraft): Notice {
  const now = new Date().toISOString().slice(0, 10);
  return {
    id: `notice-${Date.now().toString(36)}`,
    apartmentId: draft.apartmentId,
    title: draft.title,
    content: draft.content ?? "",
    category: draft.category,
    priority: draft.priority,
    audience: draft.audience,
    author: draft.author,
    publishedAt: now,
    isEmergency: draft.category === "emergency",
  };
}
