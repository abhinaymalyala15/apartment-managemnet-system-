"use client";

import { ResidentContent } from "@/components/resident/resident-content";
import { ResidentDashboard } from "@/components/resident/resident-dashboard";
import { useResidentPortal } from "@/contexts/resident-portal-context";

export default function ResidentDashboardPage() {
  const { resident, flat, block, payments, notices, services } =
    useResidentPortal();

  return (
    <ResidentContent>
      <ResidentDashboard
        resident={resident}
        flat={flat}
        block={block}
        payments={payments}
        notices={notices}
        services={services}
      />
    </ResidentContent>
  );
}
