"use client";

import { useMemo, useState } from "react";
import { ListToolbar } from "@/components/ui/list-toolbar";
import { NoticeAdminList } from "@/components/inspector/communication/notice-admin-list";
import type { NoticeItem } from "@/components/inspector/communication/notice-admin-list";

interface NoticeWorkspaceProps {
  items: NoticeItem[];
  searchPlaceholder?: string;
}

export function NoticeWorkspace({
  items,
  searchPlaceholder = "Search notices…",
}: NoticeWorkspaceProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [priority, setPriority] = useState("all");

  const filtered = useMemo(() => {
    let list = items;
    if (category !== "all") {
      list = list.filter((n) => n.category === category);
    }
    if (priority !== "all") {
      list = list.filter((n) => n.priority === priority);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          ("content" in n && n.content?.toLowerCase().includes(q)) ||
          ("author" in n && n.author?.toLowerCase().includes(q))
      );
    }
    return list;
  }, [items, search, category, priority]);

  return (
    <div className="space-y-4">
      <ListToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={searchPlaceholder}
        filters={[
          {
            id: "category",
            value: category,
            onChange: setCategory,
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
            value: priority,
            onChange: setPriority,
            placeholder: "Priority",
            options: [
              { value: "all", label: "All priorities" },
              { value: "high", label: "High" },
              { value: "medium", label: "Medium" },
              { value: "low", label: "Low" },
            ],
          },
        ]}
        resultCount={{ shown: filtered.length, total: items.length }}
      />
      <NoticeAdminList items={filtered} />
    </div>
  );
}
