"use client";

import { useMemo, useState } from "react";
import { ListToolbar } from "@/components/ui/list-toolbar";
import { EmptyState } from "@/components/ui/empty-state";
import { NoticeCardList } from "@/components/resident/notice-card-list";
import type { Notice } from "@/types";
import { Megaphone } from "lucide-react";

interface FilterableNoticeListProps {
  notices: Notice[];
}

type CategoryFilter = "all" | Notice["category"];
type PriorityFilter = "all" | Notice["priority"];
type SortKey = "newest" | "oldest" | "priority";

export function FilterableNoticeList({ notices }: FilterableNoticeListProps) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("all");
  const [sort, setSort] = useState<SortKey>("newest");

  const filtered = useMemo(() => {
    let list = [...notices];

    if (categoryFilter !== "all") {
      list = list.filter((n) => n.category === categoryFilter);
    }
    if (priorityFilter !== "all") {
      list = list.filter((n) => n.priority === priorityFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      if (sort === "priority") {
        const rank = { high: 0, medium: 1, low: 2 };
        return rank[a.priority] - rank[b.priority];
      }
      const diff =
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      return sort === "newest" ? diff : -diff;
    });

    return list;
  }, [notices, search, categoryFilter, priorityFilter, sort]);

  return (
    <div className="space-y-4">
      <ListToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search announcements…"
        filters={[
          {
            id: "category",
            value: categoryFilter,
            onChange: (v) => setCategoryFilter(v as CategoryFilter),
            placeholder: "Category",
            options: [
              { value: "all", label: "All categories" },
              { value: "general", label: "General" },
              { value: "maintenance", label: "Maintenance" },
              { value: "event", label: "Event" },
              { value: "emergency", label: "Emergency" },
            ],
          },
          {
            id: "priority",
            value: priorityFilter,
            onChange: (v) => setPriorityFilter(v as PriorityFilter),
            placeholder: "Priority",
            options: [
              { value: "all", label: "All priority" },
              { value: "high", label: "Important" },
              { value: "medium", label: "Update" },
              { value: "low", label: "Info" },
            ],
          },
        ]}
        sort={{
          id: "sort",
          value: sort,
          onChange: (v) => setSort(v as SortKey),
          placeholder: "Sort",
          options: [
            { value: "newest", label: "Newest first" },
            { value: "oldest", label: "Oldest first" },
            { value: "priority", label: "Priority" },
          ],
        }}
        resultCount={{ shown: filtered.length, total: notices.length }}
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="No announcements match"
          description="Try a different search or filter."
        />
      ) : (
        <NoticeCardList notices={filtered} expandable />
      )}
    </div>
  );
}
