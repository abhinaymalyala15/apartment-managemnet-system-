import { formatDate } from "@/lib/data";
import type { AssetTimelineEvent } from "@/types";
import {
  FileText,
  RefreshCw,
  Wrench,
  AlertTriangle,
  ClipboardCheck,
  Truck,
  Calendar,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";

const typeConfig: Record<
  AssetTimelineEvent["type"],
  { icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  installed: { icon: Package, color: "bg-muted text-muted-foreground" },
  amc_renewed: { icon: RefreshCw, color: "bg-emerald-500/10 text-emerald-700" },
  service_completed: { icon: Wrench, color: "bg-sky-500/10 text-sky-700" },
  breakdown: { icon: AlertTriangle, color: "bg-destructive/10 text-destructive" },
  inspection: { icon: ClipboardCheck, color: "bg-violet-500/10 text-violet-700" },
  document: { icon: FileText, color: "bg-amber-500/10 text-amber-800" },
  vendor_changed: { icon: Truck, color: "bg-orange-500/10 text-orange-800" },
  service_scheduled: { icon: Calendar, color: "bg-primary/10 text-primary" },
};

interface AssetTimelineProps {
  events: AssetTimelineEvent[];
  limit?: number;
  compact?: boolean;
}

export function AssetTimeline({
  events,
  limit,
  compact = false,
}: AssetTimelineProps) {
  const shown = limit ? events.slice(0, limit) : events;

  if (shown.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No timeline events yet.</p>
    );
  }

  return (
    <ul className="relative ml-2 space-y-0 border-l pl-6">
      {shown.map((event, index) => {
        const config = typeConfig[event.type];
        const Icon = config.icon;
        const isLast = index === shown.length - 1;

        return (
          <li key={event.id} className={cn("relative pb-6", isLast && "pb-0")}>
            <span
              className={cn(
                "absolute -left-[25px] top-0.5 flex h-[18px] w-[18px] items-center justify-center rounded-full border-2 border-background",
                config.color
              )}
            >
              <Icon className="h-2.5 w-2.5" />
            </span>
            <p className="text-xs font-medium text-muted-foreground">
              {formatDate(event.date)}
            </p>
            <p className={cn("font-medium", compact ? "text-sm" : "text-base")}>
              {event.title}
            </p>
            {!compact && (
              <p className="text-sm text-muted-foreground">{event.description}</p>
            )}
          </li>
        );
      })}
    </ul>
  );
}
