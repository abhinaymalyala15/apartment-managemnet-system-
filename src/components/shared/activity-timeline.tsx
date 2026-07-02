import {
  Bell,
  Calendar,
  CreditCard,
  FileText,
  Home,
  MessageSquare,
  Phone,
  StickyNote,
  UserPlus,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/data";
import type { FlatTimelineEvent } from "@/types";
import { cn } from "@/lib/utils";

const typeConfig: Record<
  FlatTimelineEvent["type"],
  { icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  payment: { icon: CreditCard, color: "bg-success text-success" },
  notice: { icon: Bell, color: "bg-primary/10 text-primary" },
  service: { icon: Wrench, color: "bg-sky-500/10 text-sky-700" },
  family: { icon: UserPlus, color: "bg-amber-500/10 text-amber-800" },
  occupancy: { icon: Home, color: "bg-muted text-muted-foreground" },
  document: { icon: FileText, color: "bg-violet-500/10 text-violet-700" },
  follow_up: { icon: Phone, color: "bg-orange-500/10 text-orange-800" },
  communication: { icon: MessageSquare, color: "bg-cyan-500/10 text-cyan-800" },
  note: { icon: StickyNote, color: "bg-muted text-muted-foreground" },
};

interface ActivityTimelineProps {
  events: FlatTimelineEvent[];
  limit?: number;
  compact?: boolean;
  className?: string;
}

export function ActivityTimeline({
  events,
  limit,
  compact = false,
  className,
}: ActivityTimelineProps) {
  const shown = limit ? events.slice(0, limit) : events;

  if (shown.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No activity to show yet.</p>
    );
  }

  return (
    <ul className={cn("relative space-y-0", className)}>
      {shown.map((event, index) => {
        const config = typeConfig[event.type];
        const Icon = config.icon;
        const isLast = index === shown.length - 1;

        const content = (
          <>
            <span
              className={cn(
                "absolute -left-[9px] top-1.5 flex h-[18px] w-[18px] items-center justify-center rounded-full border-2 border-background",
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
          </>
        );

        return (
          <li
            key={event.id}
            className={cn(
              "relative border-l-2 border-border pb-4 pl-5",
              isLast && "pb-0"
            )}
          >
            {event.href ? (
              <Link href={event.href} className="block rounded-lg hover:bg-muted/40 -ml-2 pl-2 pr-2 py-1">
                {content}
              </Link>
            ) : (
              content
            )}
          </li>
        );
      })}
    </ul>
  );
}

interface ActivityTimelineHeaderProps {
  flatNumber: string;
}

export function ActivityTimelineHeader({ flatNumber }: ActivityTimelineHeaderProps) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Calendar className="h-4 w-4" />
      <span>Flat {flatNumber} activity</span>
    </div>
  );
}
