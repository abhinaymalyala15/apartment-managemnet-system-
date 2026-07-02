"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Building2,
  Home,
  Layers,
  Search,
  User,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { groupSearchResults, searchAdminDirectory } from "@/lib/admin-data";
import type { AdminSearchResult } from "@/types";
import { cn } from "@/lib/utils";
import { useAdminActions } from "@/components/inspector/admin-action-provider";
import { useExplorer } from "@/components/inspector/explorer/explorer-provider";

const kindConfig: Record<
  AdminSearchResult["kind"],
  { icon: React.ComponentType<{ className?: string }>; label: string; emoji: string }
> = {
  flat: { icon: Home, label: "Flat", emoji: "🏠" },
  person: { icon: User, label: "Resident", emoji: "👤" },
  block: { icon: Building2, label: "Block", emoji: "🏢" },
  floor: { icon: Layers, label: "Floor", emoji: "📍" },
};

const statusLabels = {
  paid: "Paid",
  pending: "Due soon",
  overdue: "Overdue",
  vacant: "Vacant",
} as const;

interface AdminGlobalSearchProps {
  className?: string;
  showTrigger?: boolean;
}

export function AdminGlobalSearch({
  className,
  showTrigger = true,
}: AdminGlobalSearchProps) {
  const { searchOpen, openSearch, closeSearch } = useAdminActions();
  const { navigateFromSearch } = useExplorer();
  const [query, setQuery] = useState("");

  const results = useMemo(() => searchAdminDirectory(query), [query]);
  const grouped = useMemo(() => groupSearchResults(results), [results]);

  const handleClose = useCallback(() => {
    closeSearch();
    setQuery("");
  }, [closeSearch]);

  const handleSelect = useCallback(
    (result: AdminSearchResult) => {
      navigateFromSearch(result);
      closeSearch();
      setQuery("");
    },
    [closeSearch, navigateFromSearch]
  );

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        openSearch();
      }
      if (e.key === "Escape") handleClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleClose, openSearch]);

  return (
    <>
      {showTrigger && (
        <button
          type="button"
          onClick={openSearch}
          className={cn(
            "flex h-10 w-full items-center gap-2 rounded-xl border bg-background px-3 text-sm text-muted-foreground shadow-sm transition-colors hover:bg-muted/50",
            className
          )}
        >
          <Search className="h-4 w-4 shrink-0" />
          <span className="truncate">
            Search flat, owner, tenant, phone, block, floor…
          </span>
          <kbd className="ml-auto hidden rounded border bg-muted px-1.5 py-0.5 text-[10px] font-medium sm:inline">
            ⌘K
          </kbd>
        </button>
      )}

      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 pt-[max(1rem,8vh)] backdrop-blur-sm">
          <div className="absolute inset-0" onClick={handleClose} aria-hidden />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Search community directory"
            className="relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl border bg-background shadow-2xl"
          >
            <div className="flex items-center gap-2 border-b px-4 py-2">
              <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
              <Input
                autoFocus
                placeholder="Flat number, owner, tenant, family member, phone, block, floor…"
                className="h-11 border-0 text-base shadow-none focus-visible:ring-0"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0"
                onClick={handleClose}
                aria-label="Close search"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="max-h-[min(65vh,480px)] overflow-y-auto p-2">
              {grouped.length === 0 ? (
                <p className="px-4 py-12 text-center text-sm text-muted-foreground">
                  {query.trim()
                    ? "No matches in the community directory."
                    : "Start typing to search flats, residents, blocks, and floors."}
                </p>
              ) : (
                <div className="space-y-4">
                  {grouped.map((group) => {
                    const config = kindConfig[group.kind];
                    const Icon = config.icon;
                    return (
                      <section key={group.kind}>
                        <h3 className="flex items-center gap-2 px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          <Icon className="h-3.5 w-3.5" />
                          {config.label}
                          <span className="font-normal normal-case">
                            ({group.results.length})
                          </span>
                        </h3>
                        <ul className="overflow-hidden rounded-xl border bg-card">
                          {group.results.map((result) => (
                            <SearchResultRow
                              key={result.id}
                              result={result}
                              config={config}
                              onSelect={() => handleSelect(result)}
                            />
                          ))}
                        </ul>
                      </section>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t bg-muted/30 px-4 py-2.5 text-xs text-muted-foreground">
              <span>↑↓ navigate · Enter to select · Esc to close</span>
              <span>Explorer syncs with search results</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function SearchResultRow({
  result,
  config,
  onSelect,
}: {
  result: AdminSearchResult;
  config: (typeof kindConfig)[AdminSearchResult["kind"]];
  onSelect: () => void;
}) {
  const Icon = config.icon;

  return (
    <li className="border-b last:border-b-0">
      <button
        type="button"
        onClick={onSelect}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50"
      >
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="font-medium">{result.title}</p>
            <p className="truncate text-xs text-muted-foreground">
              {result.subtitle}
            </p>
          </div>
        </div>
        {result.maintenanceStatus && (
          <Badge
            variant={
              result.maintenanceStatus === "overdue"
                ? "destructive"
                : "secondary"
            }
            className="shrink-0 text-[10px]"
          >
            {statusLabels[result.maintenanceStatus]}
          </Badge>
        )}
      </button>
    </li>
  );
}
