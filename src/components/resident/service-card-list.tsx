import { Calendar, Wrench } from "lucide-react";
import { formatDate } from "@/lib/data";
import type { Service } from "@/types";

interface ServiceCardListProps {
  services: Service[];
  emptyMessage?: string;
}

export function ServiceCardList({
  services,
  emptyMessage = "Nothing scheduled right now",
}: ServiceCardListProps) {
  if (services.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed bg-muted/30 px-4 py-10 text-center">
        <Wrench className="mx-auto h-8 w-8 text-muted-foreground/40" />
        <p className="mt-3 text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {services.map((service) => (
        <div
          key={service.id}
          className="overflow-hidden rounded-2xl border bg-card shadow-sm"
        >
          <div className="flex">
            <div className="w-1 shrink-0 bg-sky-500" />
            <div className="flex-1 p-4">
              <p className="font-medium">{service.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {service.description}
              </p>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                <span className="inline-flex items-center gap-1.5 font-medium text-sky-700">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(service.scheduledDate)} · {service.scheduledTime}
                </span>
                <span className="text-muted-foreground">
                  {service.vendor}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
