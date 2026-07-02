import type { FlatBillStatus } from "@/lib/explorer-data";
import { cn } from "@/lib/utils";

const statusStyles: Record<
  FlatBillStatus,
  { dot: string; label: string }
> = {
  paid: { dot: "bg-success", label: "Paid" },
  pending: { dot: "bg-warning", label: "Due soon" },
  overdue: { dot: "bg-destructive", label: "Overdue" },
  vacant: { dot: "bg-muted-foreground/35", label: "Vacant" },
};

interface FlatStatusDotProps {
  status: FlatBillStatus;
  showLabel?: boolean;
  className?: string;
}

export function FlatStatusDot({
  status,
  showLabel = false,
  className,
}: FlatStatusDotProps) {
  const config = statusStyles[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span
        className={cn("h-2 w-2 shrink-0 rounded-full", config.dot)}
        aria-hidden
      />
      {showLabel && (
        <span className="text-[10px] text-muted-foreground">{config.label}</span>
      )}
    </span>
  );
}

export function getFlatStatusBorderClass(status: FlatBillStatus): string {
  const borders: Record<FlatBillStatus, string> = {
    paid: "border-success/30",
    pending: "border-warning/40",
    overdue: "border-destructive/40",
    vacant: "border-border",
  };
  return borders[status];
}

export { statusStyles as flatStatusStyles };
