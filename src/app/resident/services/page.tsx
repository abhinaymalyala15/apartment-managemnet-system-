import { ResidentPageHeader } from "@/components/resident/resident-page-header";
import { ResidentContent } from "@/components/resident/resident-content";
import { ServiceCardList } from "@/components/resident/service-card-list";
import { ResidentSection } from "@/components/resident/resident-section";
import { getResidentContext } from "@/lib/resident-context";

export default function ResidentServicesPage() {
  const { services } = getResidentContext();

  const upcoming = services.filter((s) => s.status === "scheduled");
  const done = services.filter((s) => s.status === "completed");

  return (
    <>
      <ResidentPageHeader
        title="Society visits"
        description="When plumbers, pest control, or vendors visit your flat or the building."
      />

      <ResidentContent>
        <ResidentSection title="Coming up">
          <ServiceCardList
            services={upcoming}
            emptyMessage="Nothing scheduled — we'll post here when a visit is planned."
          />
        </ResidentSection>

        {done.length > 0 && (
          <ResidentSection title="Recently done">
            <ServiceCardList services={done.slice(0, 5)} />
          </ResidentSection>
        )}
      </ResidentContent>
    </>
  );
}
