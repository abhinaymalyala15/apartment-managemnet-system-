"use client";

import { ResidentPageHeader } from "@/components/resident/resident-page-header";
import { ResidentContent } from "@/components/resident/resident-content";
import { FilterableNoticeList } from "@/components/resident/filterable-notice-list";
import { useResidentPortal } from "@/contexts/resident-portal-context";

export default function ResidentNoticesPage() {
  const { notices } = useResidentPortal();

  return (
    <>
      <ResidentPageHeader
        title="Notices"
        description="Messages from your society office."
        showBack={false}
      />

      <ResidentContent>
        <FilterableNoticeList notices={notices} />
      </ResidentContent>
    </>
  );
}
