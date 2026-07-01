import { ResidentPageHeader } from "@/components/resident/resident-page-header";
import { ResidentContent } from "@/components/resident/resident-content";
import { ResidentInfoList } from "@/components/resident/resident-info-list";
import { ResidentSection } from "@/components/resident/resident-section";
import { formatCurrency, formatDate } from "@/lib/data";
import { getResidentContext } from "@/lib/resident-context";
import { Car, Home } from "lucide-react";

export default function ResidentFlatPage() {
  const { flat, block, owner } = getResidentContext();

  return (
    <>
      <ResidentPageHeader
        title="My flat"
        description="Everything about your home — size, parking, and monthly charges."
      />

      <ResidentContent>
        <div className="flex items-center gap-4 rounded-2xl border bg-gradient-to-br from-violet-500/10 via-card to-card p-5 shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/15">
            <Home className="h-7 w-7 text-violet-700" />
          </div>
          <div>
            <p className="text-2xl font-bold">Flat {flat.flatNumber}</p>
            <p className="text-muted-foreground">
              {block.name} · Floor {flat.floor} · {flat.flatType}
            </p>
          </div>
        </div>

        <ResidentSection title="Flat details">
          <ResidentInfoList
            items={[
              { label: "Flat number", value: flat.flatNumber },
              { label: "Block", value: block.name },
              { label: "Floor", value: String(flat.floor) },
              { label: "Type", value: flat.flatType },
              { label: "Size", value: `${flat.areaSqft} sq.ft` },
              { label: "Bedrooms", value: String(flat.bedrooms) },
            ]}
          />
        </ResidentSection>

        <ResidentSection title="Parking & charges">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border bg-card p-4 shadow-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Car className="h-4 w-4" />
                <span className="text-sm">Parking</span>
              </div>
              <p className="mt-2 text-xl font-semibold">
                {flat.parkingSlots ?? 1} slot
              </p>
            </div>
            <div className="rounded-2xl border bg-card p-4 shadow-sm">
              <p className="text-sm text-muted-foreground">Monthly maintenance</p>
              <p className="mt-2 text-xl font-semibold">
                {formatCurrency(1300)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                ₹2 × {flat.areaSqft} sq.ft
              </p>
            </div>
          </div>
        </ResidentSection>

        {owner && (
          <ResidentSection title="Registered owner">
            <ResidentInfoList
              items={[
                { label: "Name", value: owner.fullName },
                { label: "Phone", value: owner.phone },
                { label: "Email", value: owner.email },
                {
                  label: "Owner since",
                  value: formatDate(owner.ownershipStartDate),
                },
              ]}
            />
          </ResidentSection>
        )}
      </ResidentContent>
    </>
  );
}
