import { formatDate } from "@/lib/data";
import type { Notice, Service } from "@/types";

interface InspectorActivityFeedProps {
  notices: Notice[];
  services: Service[];
}

export function InspectorActivityFeed({
  notices,
  services,
}: InspectorActivityFeedProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-xl border bg-card">
        <div className="border-b px-4 py-3">
          <h3 className="font-semibold">Messages to residents</h3>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Notices the society posted — meetings, events, and general updates.
            Not the same as vendor work below.
          </p>
        </div>
        <div className="divide-y">
          {notices.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              No messages right now
            </p>
          ) : (
            notices.map((notice) => (
              <article key={notice.id} className="px-4 py-3">
                <p className="font-medium">{notice.title}</p>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {notice.content}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Posted {formatDate(notice.publishedAt)}
                </p>
              </article>
            ))
          )}
        </div>
      </div>

      <div className="rounded-xl border bg-card">
        <div className="border-b px-4 py-3">
          <h3 className="font-semibold">Vendor visits booked</h3>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Maintenance jobs on the calendar — who is coming, when, and which
            company.
          </p>
        </div>
        <div className="divide-y">
          {services.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              No visits booked
            </p>
          ) : (
            services.map((service) => (
              <div key={service.id} className="px-4 py-3">
                <p className="font-medium">{service.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatDate(service.scheduledDate)} · {service.scheduledTime}
                </p>
                <p className="text-sm text-muted-foreground">{service.vendor}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
