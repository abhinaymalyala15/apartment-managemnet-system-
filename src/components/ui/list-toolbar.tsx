"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface FilterOption {
  value: string;
  label: string;
}

export interface ListToolbarFilter {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: FilterOption[];
  className?: string;
}

interface ListToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: ListToolbarFilter[];
  resultCount?: { shown: number; total: number };
  sort?: ListToolbarFilter;
  className?: string;
}

export function ListToolbar({
  search,
  onSearchChange,
  searchPlaceholder = "Search…",
  filters = [],
  resultCount,
  sort,
  className,
}: ListToolbarProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            className="pl-9"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          {filters.map((filter) => (
            <Select
              key={filter.id}
              value={filter.value}
              onValueChange={(v) => filter.onChange(v ?? filter.options[0]?.value ?? "all")}
            >
              <SelectTrigger className={cn("w-full sm:w-[160px]", filter.className)}>
                <SelectValue placeholder={filter.placeholder} />
              </SelectTrigger>
              <SelectContent>
                {filter.options.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}
          {sort && (
            <Select value={sort.value} onValueChange={(v) => sort.onChange(v ?? sort.options[0]?.value ?? "")}>
              <SelectTrigger className={cn("w-full sm:w-[160px]", sort.className)}>
                <SelectValue placeholder={sort.placeholder} />
              </SelectTrigger>
              <SelectContent>
                {sort.options.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>
      {resultCount && (
        <p className="text-xs text-muted-foreground">
          Showing {resultCount.shown} of {resultCount.total}
        </p>
      )}
    </div>
  );
}
