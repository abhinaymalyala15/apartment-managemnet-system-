"use client";

import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminActions } from "@/components/inspector/admin-action-provider";

export function AdminDashboardSearch() {
  const { openSearch } = useAdminActions();

  return (
    <Button
      type="button"
      variant="outline"
      className="h-10 w-full justify-start gap-2 font-normal text-muted-foreground sm:max-w-md"
      onClick={() => openSearch()}
    >
      <Search className="h-4 w-4 shrink-0" />
      <span className="truncate">Search residents, flats, payments…</span>
      <kbd className="ml-auto hidden shrink-0 rounded border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline">
        ⌘K
      </kbd>
    </Button>
  );
}
