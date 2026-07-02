import { Calendar, Wrench, Building2, Home } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/data";
import type { Service } from "@/types";

interface ServiceCardListProps {
  services: Service[];
  emptyMessage?: string;
  showScope?: boolean;
}

export function ServiceCardList({
  services,
  emptyMessage = "Nothing scheduled right now",
  showScope = false,
}: ServiceCardListProps) {
  if (services.length === 0) {
    return (
      <EmptyState
        icon={Wrench}
        title="No visits scheduled"
        description={emptyMessage}
        className="py-8"
      />
    );
  }

  return (
    <div className="space-y-3">
      {services.map((service) => (
        <div key={service.id} className="surface-card overflow-hidden">
          <div className="p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <p className="font-medium">{service.title}</p>
              {showScope && (
                <Badge variant="outline" className="gap-1 text-[10px]">
                  {service.flatId ? (
                    <>
                      <Home className="h-3 w-3" />
                      My flat
                    </>
                  ) : (
                    <>
                      <Building2 className="h-3 w-3" />
                      Building
                    </>
                  )}
                </Badge>
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {service.description}
            </p>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
              <span className="inline-flex items-center gap-1.5 font-medium text-primary">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(service.scheduledDate)} · {service.scheduledTime}
              </span>
              <span className="text-muted-foreground">{service.vendor}</span>
              {service.frequency && (
                <span className="text-xs text-muted-foreground">
                  {service.serviceType} · {service.frequency}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
