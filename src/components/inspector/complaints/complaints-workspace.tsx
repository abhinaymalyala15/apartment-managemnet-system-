"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ListToolbar } from "@/components/ui/list-toolbar";
import { Badge } from "@/components/ui/badge";
import { routes } from "@/config/routes";
import type { EnrichedComplaint } from "@/lib/admin-data";
import { formatDateTime } from "@/lib/admin-data";

interface ComplaintsWorkspaceProps {
  items: EnrichedComplaint[];
  emptyLabel?: string;
}

const priorityVariant: Record<
  EnrichedComplaint["priority"],
  "destructive" | "secondary" | "outline"
> = {
  high: "destructive",
  medium: "secondary",
  low: "outline",
};

export function ComplaintsWorkspace({
  items,
  emptyLabel = "No complaints in this queue",
}: ComplaintsWorkspaceProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.flatNumber.toLowerCase().includes(q) ||
        item.residentName.toLowerCase().includes(q)
    );
  }, [items, search]);

  return (
    <div className="space-y-4">
      <ListToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search complaints…"
      />
      {filtered.length === 0 ? (
        <div className="surface-card px-4 py-8 text-center text-sm text-muted-foreground">
          {emptyLabel}
        </div>
      ) : (
        <ul className="surface-card divide-y">
          {filtered.map((item) => (
            <li key={item.id}>
              <Link
                href={routes.dashboard.inspector.complaints.detail(item.id)}
                className="flex flex-col gap-2 px-4 py-3.5 hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-medium">{item.title}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    Flat {item.flatNumber} · {item.residentName}
                  </p>
                  <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge variant={priorityVariant[item.priority]}>
                    {item.priority}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDateTime(item.createdAt)}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
