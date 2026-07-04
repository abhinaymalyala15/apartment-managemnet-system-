"use client";

import { Search } from "lucide-react";
import { useAdminActions } from "@/components/inspector/admin-action-provider";
import { cn } from "@/lib/utils";

export function AdminDashboardSearch() {
  const { openSearch } = useAdminActions();

  return (
    <button
      type="button"
      onClick={() => openSearch()}
      className={cn(
        "group flex h-11 w-full items-center gap-3 rounded-xl border border-border/70 bg-background px-4",
        "text-left text-sm shadow-sm transition-all",
        "hover:border-border hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
      )}
    >
      <Search className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
      <span className="min-w-0 flex-1 truncate text-muted-foreground group-hover:text-foreground/80">
        Search residents, flats, payments…
      </span>
      <kbd className="hidden shrink-0 rounded-md border border-border/80 bg-muted/60 px-2 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline">
        ⌘K
      </kbd>
    </button>
  );
}
