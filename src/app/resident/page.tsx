import { ResidentContent } from "@/components/resident/resident-content";
import { ResidentWelcomeHero } from "@/components/resident/resident-welcome-hero";
import { ResidentStatusBanner } from "@/components/resident/resident-status-banner";
import { ResidentQuickTiles } from "@/components/resident/resident-quick-tiles";
import { ResidentSection } from "@/components/resident/resident-section";
import { NoticeCardList } from "@/components/resident/notice-card-list";
import { ResidentHelpCard } from "@/components/resident/resident-help-card";
import { ButtonLink } from "@/components/ui/button-link";
import { getApartment } from "@/lib/data";
import { getResidentContext } from "@/lib/resident-context";

export default function ResidentDashboardPage() {
  const apartment = getApartment();
  const { resident, flat, block, payments, notices, services } =
    getResidentContext();
  const latestNotices = notices.slice(0, 2);
  const upcomingVisits = services.filter((s) => s.status === "scheduled").length;

  return (
    <ResidentContent className="space-y-6 sm:space-y-7">
      <ResidentWelcomeHero
        resident={resident}
        flat={flat}
        block={block}
        apartment={apartment}
      />

      <ResidentStatusBanner payments={payments} />

      {upcomingVisits > 0 && (
        <div className="flex items-center justify-between rounded-2xl border border-sky-200/80 bg-sky-50 px-4 py-3 text-sm dark:border-sky-900/40 dark:bg-sky-950/30">
          <p>
            <span className="font-medium">{upcomingVisits} society visit</span>
            {upcomingVisits > 1 ? "s" : ""} coming up
          </p>
          <ButtonLink href="/resident/services" variant="ghost" size="sm">
            View schedule
          </ButtonLink>
        </div>
      )}

      <ResidentQuickTiles />

      {latestNotices.length > 0 && (
        <ResidentSection
          title="Latest announcements"
          action={
            <ButtonLink href="/resident/notices" variant="ghost" size="sm">
              See all
            </ButtonLink>
          }
        >
          <NoticeCardList notices={latestNotices} />
        </ResidentSection>
      )}

      <ResidentHelpCard apartment={apartment} />
    </ResidentContent>
  );
}
