"use client";

import { ResidentPageHeader } from "@/components/resident/resident-page-header";
import { ResidentContent } from "@/components/resident/resident-content";
import { FilterableServiceList } from "@/components/resident/filterable-service-list";
import { useResidentPortal } from "@/contexts/resident-portal-context";

export default function ResidentServicesPage() {
  const { services } = useResidentPortal();

  return (
    <>
      <ResidentPageHeader
        title="Work visits"
        description="When plumbers, lift service, or other vendors visit your building or flat."
      />

      <ResidentContent>
        <FilterableServiceList services={services} />
      </ResidentContent>
    </>
  );
}
