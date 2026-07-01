import { ResidentPageHeader } from "@/components/resident/resident-page-header";
import { ResidentContent } from "@/components/resident/resident-content";
import { ResidentInfoList } from "@/components/resident/resident-info-list";
import { ResidentSection } from "@/components/resident/resident-section";
import { ResidentHelpCard } from "@/components/resident/resident-help-card";
import { getApartment, formatDate } from "@/lib/data";
import { getResidentContext } from "@/lib/resident-context";

export default function ResidentProfilePage() {
  const apartment = getApartment();
  const { resident, flat, block, owner } = getResidentContext();

  const initials = resident.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  return (
    <>
      <ResidentPageHeader
        title="My account"
        description="Your contact details and flat registration."
        showBack={false}
      />

      <ResidentContent>
        <div className="flex items-center gap-4 rounded-2xl border bg-gradient-to-br from-primary/10 via-card to-card p-5 shadow-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-lg font-semibold text-primary-foreground">
            {initials}
          </div>
          <div>
            <p className="text-lg font-semibold">{resident.fullName}</p>
            <p className="text-sm text-muted-foreground">
              Flat {flat.flatNumber}, {block.name}
            </p>
            <p className="text-sm text-muted-foreground">{apartment.name}</p>
          </div>
        </div>

        <ResidentSection title="Contact">
          <ResidentInfoList
            items={[
              { label: "Email", value: resident.email },
              { label: "Phone", value: resident.phone },
            ]}
          />
        </ResidentSection>

        <ResidentSection title="Flat registration">
          <ResidentInfoList
            items={[
              { label: "Owner", value: owner?.fullName ?? resident.fullName },
              { label: "Flat", value: flat.flatNumber },
              { label: "Block", value: block.name },
              {
                label: "Owner since",
                value: owner
                  ? formatDate(owner.ownershipStartDate)
                  : "—",
              },
            ]}
          />
        </ResidentSection>

        <ResidentHelpCard apartment={apartment} />
      </ResidentContent>
    </>
  );
}
