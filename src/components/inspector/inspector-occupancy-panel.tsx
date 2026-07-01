import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface InspectorOccupancyPanelProps {
  totalFlats: number;
  ownerOccupied: number;
  tenantOccupied: number;
  vacantFlats: number;
}

export function InspectorOccupancyPanel({
  totalFlats,
  ownerOccupied,
  tenantOccupied,
  vacantFlats,
}: InspectorOccupancyPanelProps) {
  const rows = [
    { label: "Owners living here", value: ownerOccupied },
    { label: "Tenants living here", value: tenantOccupied },
    { label: "Empty flats", value: vacantFlats },
    { label: "Total flats", value: totalFlats, bold: true },
  ];

  return (
    <div className="rounded-xl border bg-card p-4">
      <dl className="space-y-3">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between text-sm"
          >
            <dt className="text-muted-foreground">{row.label}</dt>
            <dd
              className={
                row.bold
                  ? "text-lg font-semibold tabular-nums"
                  : "font-semibold tabular-nums"
              }
            >
              {row.value}
            </dd>
          </div>
        ))}
      </dl>

      <Link
        href="/inspector/flats"
        className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
      >
        Open flat list
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
