import type { ReportDrillRow } from "@/types";
import { cn } from "@/lib/utils";

interface ReportBlockListProps {
  title: string;
  rows: ReportDrillRow[];
  emptyMessage?: string;
}

export function ReportBlockList({
  title,
  rows,
  emptyMessage = "No data for this block.",
}: ReportBlockListProps) {
  return (
    <section className="space-y-3">
      {title ? (
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </h2>
      ) : null}
      {rows.length === 0 ? (
        <div className="surface-card px-4 py-8 text-center text-sm text-muted-foreground">
          {emptyMessage}
        </div>
      ) : (
        <ul className="surface-card divide-y">
          {rows.map((row) => (
            <li key={row.id} className="px-4 py-3.5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium">{row.label}</p>
                  {row.sublabel && (
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {row.sublabel}
                    </p>
                  )}
                </div>
                <p
                  className={cn(
                    "shrink-0 text-sm font-medium tabular-nums",
                    row.highlight && "text-destructive"
                  )}
                >
                  {row.value}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
