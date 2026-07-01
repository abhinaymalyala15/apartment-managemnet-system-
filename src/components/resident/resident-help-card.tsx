import { Phone, Mail, Headphones } from "lucide-react";
import type { Apartment } from "@/types";

interface ResidentHelpCardProps {
  apartment: Apartment;
}

export function ResidentHelpCard({ apartment }: ResidentHelpCardProps) {
  return (
    <div className="rounded-2xl border border-dashed bg-muted/40 p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <Headphones className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium">Need help?</p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Contact the apartment office for bills, complaints, or general
            queries.
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <a
              href={`tel:${apartment.phone.replace(/\s/g, "")}`}
              className="inline-flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-muted"
            >
              <Phone className="h-4 w-4 text-primary" />
              {apartment.phone}
            </a>
            <a
              href={`mailto:${apartment.email}`}
              className="inline-flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-muted"
            >
              <Mail className="h-4 w-4 text-primary" />
              <span className="truncate">{apartment.email}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
