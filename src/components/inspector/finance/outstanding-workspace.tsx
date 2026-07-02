"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ListToolbar } from "@/components/ui/list-toolbar";
import { OutstandingQueue } from "@/components/inspector/finance/outstanding-queue";
import { getBlocks } from "@/lib/data";
import { getOutstandingQueue } from "@/lib/finance-data";

function OutstandingWorkspaceInner() {
  const searchParams = useSearchParams();
  const blockFromUrl = searchParams.get("block");
  const [search, setSearch] = useState("");
  const [blockFilter, setBlockFilter] = useState("all");
  const blocks = getBlocks();
  const allItems = getOutstandingQueue();

  useEffect(() => {
    if (blockFromUrl) {
      setBlockFilter(blockFromUrl);
    }
  }, [blockFromUrl]);

  const filtered = useMemo(() => {
    return getOutstandingQueue({
      blockId: blockFilter !== "all" ? blockFilter : undefined,
      search: search.trim() || undefined,
    });
  }, [search, blockFilter]);

  return (
    <div className="space-y-4">
      <ListToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search flat or resident…"
        filters={[
          {
            id: "block",
            value: blockFilter,
            onChange: setBlockFilter,
            placeholder: "Block",
            options: [
              { value: "all", label: "All blocks" },
              ...blocks.map((b) => ({ value: b.id, label: b.name })),
            ],
          },
        ]}
        resultCount={{ shown: filtered.length, total: allItems.length }}
      />

      <OutstandingQueue items={filtered} />
    </div>
  );
}

export function OutstandingWorkspace() {
  return (
    <Suspense fallback={null}>
      <OutstandingWorkspaceInner />
    </Suspense>
  );
}
