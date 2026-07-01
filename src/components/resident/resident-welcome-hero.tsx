import { Building2, MapPin } from "lucide-react";
import { formatCurrency } from "@/lib/data";
import type { Apartment, Block, Flat, Resident } from "@/types";

interface ResidentWelcomeHeroProps {
  resident: Resident;
  flat: Flat;
  block: Block;
  apartment: Apartment;
}

export function ResidentWelcomeHero({
  resident,
  flat,
  block,
  apartment,
}: ResidentWelcomeHeroProps) {
  const firstName = resident.fullName.split(" ")[0];

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-[oklch(0.38_0.12_240)] p-6 text-primary-foreground shadow-lg sm:p-7">
      <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -bottom-12 -left-6 h-32 w-32 rounded-full bg-white/5" />

      <div className="relative">
        <p className="text-sm font-medium text-primary-foreground/80">
          Good to see you
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
          {firstName}
        </h1>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-primary-foreground/85">
          {apartment.tagline}
        </p>

        <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
          <div className="rounded-2xl bg-white/15 px-4 py-3 backdrop-blur-sm">
            <p className="text-[11px] font-medium uppercase tracking-wider text-primary-foreground/70">
              Your flat
            </p>
            <p className="mt-0.5 text-3xl font-bold tracking-tight">
              {flat.flatNumber}
            </p>
            <p className="mt-1 text-sm text-primary-foreground/85">
              {block.name} · Floor {flat.floor}
            </p>
          </div>

          <div className="space-y-1.5 text-sm text-primary-foreground/85">
            <p className="flex items-center gap-2">
              <Building2 className="h-4 w-4 shrink-0 opacity-80" />
              {flat.flatType} · {flat.areaSqft} sq.ft
            </p>
            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0 opacity-80" />
              {formatCurrency(1300)}/month
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
