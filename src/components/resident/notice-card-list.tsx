import { Calendar, Megaphone } from "lucide-react";
import { formatDate } from "@/lib/data";
import type { Notice } from "@/types";
import { cn } from "@/lib/utils";

interface NoticeCardListProps {
  notices: Notice[];
}

export function NoticeCardList({ notices }: NoticeCardListProps) {
  return (
    <div className="space-y-3">
      {notices.map((notice) => (
        <article
          key={notice.id}
          className={cn(
            "overflow-hidden rounded-2xl border bg-card shadow-sm",
            notice.priority === "high" && "border-amber-200/80"
          )}
        >
          <div className="flex">
            <div
              className={cn(
                "w-1 shrink-0",
                notice.priority === "high"
                  ? "bg-amber-500"
                  : notice.category === "emergency"
                    ? "bg-red-500"
                    : "bg-primary/30"
              )}
            />
            <div className="flex-1 p-4">
              <div className="flex items-start gap-2">
                <Megaphone className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium leading-snug">{notice.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {notice.content}
                  </p>
                  <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDate(notice.publishedAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
