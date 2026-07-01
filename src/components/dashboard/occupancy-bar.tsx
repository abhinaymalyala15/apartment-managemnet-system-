import { cn } from "@/lib/utils";

interface OccupancyBarProps {
  occupied: number;
  total: number;
  showLabel?: boolean;
  className?: string;
}

export function OccupancyBar({
  occupied,
  total,
  showLabel = true,
  className,
}: OccupancyBarProps) {
  const pct = total > 0 ? Math.round((occupied / total) * 100) : 0;

  return (
    <div className={cn("space-y-1.5", className)}>
      {showLabel && (
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Occupancy</span>
          <span className="font-medium">
            {occupied}/{total} ({pct}%)
          </span>
        </div>
      )}
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
