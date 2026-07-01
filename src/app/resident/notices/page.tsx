import { ResidentPageHeader } from "@/components/resident/resident-page-header";
import { ResidentContent } from "@/components/resident/resident-content";
import { NoticeCardList } from "@/components/resident/notice-card-list";
import { getResidentContext } from "@/lib/resident-context";

export default function ResidentNoticesPage() {
  const { notices } = getResidentContext();

  return (
    <>
      <ResidentPageHeader
        title="Announcements"
        description="Messages from the apartment office — events, maintenance, and important updates."
        showBack={false}
      />

      <ResidentContent>
        {notices.length === 0 ? (
          <div className="rounded-2xl border border-dashed bg-muted/30 px-4 py-12 text-center">
            <p className="text-sm text-muted-foreground">
              No announcements right now. Check back later.
            </p>
          </div>
        ) : (
          <NoticeCardList notices={notices} />
        )}
      </ResidentContent>
    </>
  );
}
