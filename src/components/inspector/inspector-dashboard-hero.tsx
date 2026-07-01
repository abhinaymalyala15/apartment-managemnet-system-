import { Badge } from "@/components/ui/badge";
import type { Apartment } from "@/types";

interface InspectorDashboardHeroProps {
  apartment: Apartment;
  billingMonth: string;
}

export function InspectorDashboardHero({
  apartment,
  billingMonth,
}: InspectorDashboardHeroProps) {
  return (
    <header className="mb-8 border-b pb-6">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="font-normal">
          Read-only
        </Badge>
        <Badge variant="secondary" className="font-normal">
          {billingMonth}
        </Badge>
      </div>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
        {apartment.name}
      </h1>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        A quick summary of bills, flats, and society updates. Use the sidebar
        to open full lists.
      </p>
    </header>
  );
}
