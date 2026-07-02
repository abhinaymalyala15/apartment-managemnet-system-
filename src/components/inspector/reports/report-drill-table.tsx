import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { ReportDrillRow } from "@/types";
import { cn } from "@/lib/utils";

interface ReportDrillTableProps {
  title: string;
  description?: string;
  rows: ReportDrillRow[];
  emptyMessage?: string;
}

export function ReportDrillTable({
  title,
  description,
  rows,
  emptyMessage = "No data for this scope.",
}: ReportDrillTableProps) {
  return (
    <div className="surface-card overflow-hidden">
      <div className="overflow-hidden">
      {title ? (
        <div className="border-b px-4 py-3 sm:px-5">
          <h2 className="font-semibold">{title}</h2>
          {description && (
            <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      ) : null}
      {rows.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-muted-foreground sm:px-5">
          {emptyMessage}
        </p>
      ) : (
        <ul className="divide-y">
          {rows.map((row) => {
            const content = (
              <>
                <div className="min-w-0">
                  <p className="font-medium">{row.label}</p>
                  {row.sublabel && (
                    <p className="truncate text-sm text-muted-foreground">
                      {row.sublabel}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-3 text-right">
                  <div>
                    <p
                      className={cn(
                        "font-medium tabular-nums",
                        row.highlight && "text-destructive"
                      )}
                    >
                      {row.value}
                    </p>
                    {row.secondary && (
                      <p className="text-xs capitalize text-muted-foreground">
                        {row.secondary}
                      </p>
                    )}
                  </div>
                  {row.href && (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </>
            );

            if (row.href) {
              return (
                <li key={row.id}>
                  <Link
                    href={row.href}
                    className="flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-muted/50 sm:px-5"
                  >
                    {content}
                  </Link>
                </li>
              );
            }

            return (
              <li
                key={row.id}
                className="flex items-center justify-between gap-4 px-4 py-3 sm:px-5"
              >
                {content}
              </li>
            );
          })}
        </ul>
      )}
      </div>
    </div>
  );
}
