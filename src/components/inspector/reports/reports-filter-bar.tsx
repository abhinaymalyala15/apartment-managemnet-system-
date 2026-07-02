"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getBlocks } from "@/lib/data";

const PERIOD_OPTIONS = [
  { value: "all", label: "All" },
  { value: "week", label: "This week" },
  { value: "month", label: "This month" },
] as const;

export function ReportsFilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const blocks = getBlocks();

  const blockId = searchParams.get("block") ?? blocks[0]?.id ?? "block-a";
  const period = searchParams.get("period") ?? "all";

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(key, value);
      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams]
  );

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <Select value={blockId} onValueChange={(v) => updateParam("block", v ?? blockId)}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Block" />
        </SelectTrigger>
        <SelectContent>
          {blocks.map((block) => (
            <SelectItem key={block.id} value={block.id}>
              {block.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={period} onValueChange={(v) => updateParam("period", v ?? "all")}>
        <SelectTrigger className="w-full sm:w-[160px]">
          <SelectValue placeholder="Period" />
        </SelectTrigger>
        <SelectContent>
          {PERIOD_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
