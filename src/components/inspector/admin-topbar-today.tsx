"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { AdminTopbarSummary } from "@/lib/admin-data";
import { cn } from "@/lib/utils";

interface AdminTopbarTodayProps {
  summary: AdminTopbarSummary;
}

export function AdminTopbarToday({ summary }: AdminTopbarTodayProps) {
  return (
    <div className="scroll-row min-w-0 flex-1">
      {summary.quickLinks.map((link) => (
        <Link
          key={link.id}
          href={link.href}
          className={cn(
            "inline-flex h-9 shrink-0 items-center gap-2 rounded-lg border bg-background px-3 text-sm font-medium shadow-sm transition-colors hover:bg-muted/50",
            link.urgent && link.count > 0 && "border-destructive/30 bg-destructive/5"
          )}
        >
          <span>{link.label}</span>
          <Badge
            variant={
              link.urgent && link.count > 0
                ? "destructive"
                : link.count > 0
                  ? "secondary"
                  : "outline"
            }
            className="h-5 min-w-5 justify-center px-1.5 text-[11px]"
          >
            {link.count}
          </Badge>
        </Link>
      ))}
    </div>
  );
}
