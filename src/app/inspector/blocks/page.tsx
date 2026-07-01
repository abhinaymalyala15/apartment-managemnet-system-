import { PageHeader } from "@/components/dashboard/page-header";
import { PageSection } from "@/components/dashboard/page-section";
import { OccupancyBar } from "@/components/dashboard/occupancy-bar";
import { ButtonLink } from "@/components/ui/button-link";
import { getBlocks, getFlatsByBlock } from "@/lib/data";
import { Building2, ArrowRight } from "lucide-react";

export default function InspectorBlocksPage() {
  const blocks = getBlocks();

  return (
    <>
      <PageHeader
        title="Blocks & Flats"
        subtitle="Browse apartment structure and flat occupancy"
      />

      <div className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8">
        <div className="grid gap-4">
          {blocks.map((block) => {
            const flats = getFlatsByBlock(block.id);
            const occupied = flats.filter(
              (f) => f.occupancyStatus !== "vacant"
            ).length;

            return (
              <PageSection
                key={block.id}
                title={block.name}
                description={block.description}
                icon={Building2}
                action={
                  <ButtonLink
                    href={`/inspector/blocks/${block.id}`}
                    size="sm"
                  >
                    View flats
                    <ArrowRight className="h-3.5 w-3.5" />
                  </ButtonLink>
                }
                noPadding
              >
                <div className="space-y-4 p-5 sm:p-6">
                  <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {[
                      ["Code", block.code],
                      ["Floors", String(block.floorCount)],
                      ["Total flats", String(block.totalFlats)],
                      ["Occupied", `${occupied}/${flats.length}`],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <dt className="text-xs text-muted-foreground">
                          {label}
                        </dt>
                        <dd className="mt-0.5 text-sm font-medium">{value}</dd>
                      </div>
                    ))}
                  </dl>
                  <OccupancyBar occupied={occupied} total={flats.length} />
                </div>
              </PageSection>
            );
          })}
        </div>
      </div>
    </>
  );
}
