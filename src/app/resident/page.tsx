import { ResidentContent } from "@/components/resident/resident-content";
import { ResidentDashboard } from "@/components/resident/resident-dashboard";
import { getResidentContext } from "@/lib/resident-context";

export default function ResidentDashboardPage() {
  const { resident, flat, block, payments, notices, services } =
    getResidentContext();

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
