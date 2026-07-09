"use client";

import { ResidentPageHeader } from "@/components/resident/resident-page-header";
import { ResidentContent } from "@/components/resident/resident-content";
import { ActivityTimeline, ActivityTimelineHeader } from "@/components/shared/activity-timeline";
import { getResidentTimeline } from "@/lib/data";
import { useResidentPortal } from "@/contexts/resident-portal-context";

export default function ResidentTimelinePage() {
  const { flat } = useResidentPortal();
  const timeline = getResidentTimeline(flat.id);

  return (
    <>
      <ResidentPageHeader
        title="Activity timeline"
        description={`Everything that happened for Flat ${flat.flatNumber} — bills, notices, visits, and updates.`}
      />

      <ResidentContent>
        <ActivityTimelineHeader flatNumber={flat.flatNumber} />
        <div className="mt-6 pl-1">
          <ActivityTimeline events={timeline} />
        </div>
      </ResidentContent>
    </>
  );
}
