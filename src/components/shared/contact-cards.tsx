import { Phone, Mail, Clock, Shield, Users } from "lucide-react";
import type { CommitteeContacts } from "@/types";
import { cn } from "@/lib/utils";

interface ContactCardsProps {
  contacts: CommitteeContacts;
  variant?: "compact" | "full";
  className?: string;
}

export function ContactCards({
  contacts,
  variant = "full",
  className,
}: ContactCardsProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {variant === "full" && (
        <section className="space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <Shield className="h-4 w-4 text-destructive" />
            Emergency contacts
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {contacts.emergency.map((item) => (
              <div key={item.id} className="surface-card p-4">
                <p className="font-medium">{item.label}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{item.role}</p>
                <a
                  href={`tel:${item.phone.replace(/\s/g, "")}`}
                  className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                >
                  <Phone className="h-3.5 w-3.5" />
                  {item.phone}
                </a>
                <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {item.hours}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <Users className="h-4 w-4 text-primary" />
          Apartment committee
        </h3>
        <div className="space-y-3">
          {contacts.committee.map((member) => (
            <div key={member.id} className="surface-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{member.name}</p>
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                </div>
              </div>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <a
                  href={`tel:${member.phone.replace(/\s/g, "")}`}
                  className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <Phone className="h-3.5 w-3.5" />
                  {member.phone}
                </a>
                <a
                  href={`mailto:${member.email}`}
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  <Mail className="h-3.5 w-3.5" />
                  {member.email}
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {variant === "full" && (
        <div className="surface-card-muted p-4">
          <p className="font-medium">{contacts.office.label}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">{contacts.office.hours}</p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <a
              href={`tel:${contacts.office.phone.replace(/\s/g, "")}`}
              className="inline-flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm font-medium shadow-sm hover:bg-muted"
            >
              <Phone className="h-4 w-4 text-primary" />
              {contacts.office.phone}
            </a>
            <a
              href={`mailto:${contacts.office.email}`}
              className="inline-flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm font-medium shadow-sm hover:bg-muted"
            >
              <Mail className="h-4 w-4 text-primary" />
              {contacts.office.email}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
