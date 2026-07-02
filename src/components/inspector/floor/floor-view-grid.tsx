import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  FlatStatusDot,
  getFlatStatusBorderClass,
} from "@/components/inspector/explorer/flat-status-dot";
import type { FloorViewData } from "@/lib/explorer-data";
import { formatCurrency } from "@/lib/data";
import { cn } from "@/lib/utils";

interface FloorViewGridProps {
  data: FloorViewData;
}

export function FloorViewGrid({ data }: FloorViewGridProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <FlatStatusDot status="paid" showLabel />
        </span>
        <span className="inline-flex items-center gap-1.5">
          <FlatStatusDot status="pending" showLabel />
        </span>
        <span className="inline-flex items-center gap-1.5">
          <FlatStatusDot status="overdue" showLabel />
        </span>
        <span className="inline-flex items-center gap-1.5">
          <FlatStatusDot status="vacant" showLabel />
        </span>
      </div>

      {data.flats.length === 0 ? (
        <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          No flats on this floor yet.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {data.flats.map((flat) => (
            <Link
              key={flat.id}
              href={`/inspector/flats/${flat.id}`}
              className={cn(
                "group rounded-xl border bg-card p-4 shadow-sm transition-all hover:border-primary/40 hover:shadow-md",
                getFlatStatusBorderClass(flat.billStatus)
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-xl font-semibold tabular-nums">
                  {flat.flatNumber}
                </p>
                <FlatStatusDot status={flat.billStatus} />
              </div>
              <p className="mt-2 truncate text-sm font-medium">
                {flat.residentName}
              </p>
              <div className="mt-2 flex items-center justify-between gap-2">
                <Badge variant="outline" className="text-[10px]">
                  {flat.occupancyLabel}
                </Badge>
                <span className="text-[10px] text-muted-foreground">
                  {flat.billStatusLabel}
                </span>
              </div>
              {flat.pendingAmount > 0 && (
                <p className="mt-2 text-xs font-medium text-destructive tabular-nums">
                  {formatCurrency(flat.pendingAmount)}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
