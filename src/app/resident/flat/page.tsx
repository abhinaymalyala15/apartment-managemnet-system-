import Link from "next/link";
import { ResidentPageHeader } from "@/components/resident/resident-page-header";
import { ResidentContent } from "@/components/resident/resident-content";
import { ResidentInfoList } from "@/components/resident/resident-info-list";
import { ResidentSection } from "@/components/resident/resident-section";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button-link";
import {
  formatCurrency,
  formatDate,
  getMonthlyMaintenanceCharge,
  getOccupancyLabel,
  getResidentTypeLabel,
} from "@/lib/data";
import { getResidentContext } from "@/lib/resident-context";
import { routes } from "@/config/routes";
import { Car, Home, Users, Wallet } from "lucide-react";

const root = routes.dashboard.resident.root;

export default function ResidentFlatPage() {
  const { flat, block, owner, tenants } = getResidentContext();
  const monthlyCharge = getMonthlyMaintenanceCharge(flat);
  const activeTenant = tenants[0];

  return (
    <>
      <ResidentPageHeader
        title="My flat"
        description="Your home details, parking, charges, and registered occupants."
      />

      <ResidentContent>
        <div className="surface-card flex items-center gap-4 bg-gradient-to-br from-primary/8 via-card to-card p-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Home className="h-7 w-7 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold">Flat {flat.flatNumber}</p>
            <p className="text-muted-foreground">
              {block.name} · Floor {flat.floor} · {flat.flatType}
            </p>
            <Badge variant="secondary" className="mt-2">
              {getOccupancyLabel(flat.occupancyStatus)}
            </Badge>
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
              { label: "Occupancy", value: getResidentTypeLabel(flat.occupancyStatus) },
            ]}
          />
        </ResidentSection>

        <ResidentSection title="Parking & charges">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="surface-card p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Car className="h-4 w-4" />
                <span className="text-sm">Parking</span>
              </div>
              <p className="mt-2 text-xl font-semibold">
                {flat.parkingSlots ?? 1} slot
              </p>
            </div>
            <div className="surface-card p-4">
              <p className="text-sm text-muted-foreground">Monthly maintenance</p>
              <p className="mt-2 text-xl font-semibold tabular-nums">
                {formatCurrency(monthlyCharge)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                ₹2 × {flat.areaSqft} sq.ft
              </p>
            </div>
          </div>
          <ButtonLink href={`${root}/payments`} variant="outline" size="sm" className="mt-3 gap-1.5">
            <Wallet className="h-4 w-4" />
            View bill history
          </ButtonLink>
        </ResidentSection>

        {owner && (
          <ResidentSection title="Registered owner">
            <ResidentInfoList
              items={[
                { label: "Name", value: owner.fullName },
                {
                  label: "Phone",
                  value: (
                    <a href={`tel:${owner.phone.replace(/\s/g, "")}`} className="text-primary hover:underline">
                      {owner.phone}
                    </a>
                  ),
                },
                {
                  label: "Email",
                  value: (
                    <a href={`mailto:${owner.email}`} className="text-primary hover:underline">
                      {owner.email}
                    </a>
                  ),
                },
                ...(owner.alternatePhone
                  ? [{ label: "Alternate phone", value: owner.alternatePhone }]
                  : []),
                {
                  label: "Owner since",
                  value: formatDate(owner.ownershipStartDate),
                },
              ]}
            />
          </ResidentSection>
        )}

        {activeTenant && (
          <ResidentSection title="Current tenant">
            <ResidentInfoList
              items={[
                { label: "Name", value: activeTenant.fullName },
                { label: "Phone", value: activeTenant.phone },
                { label: "Lease until", value: formatDate(activeTenant.leaseEndDate) },
              ]}
            />
          </ResidentSection>
        )}

        <Link
          href={`${root}/family`}
          className="surface-card flex items-center justify-between px-4 py-3 text-sm hover:bg-muted/40"
        >
          <span className="flex items-center gap-2 font-medium">
            <Users className="h-4 w-4 text-muted-foreground" />
            View family members
          </span>
          <span className="text-muted-foreground">→</span>
        </Link>
      </ResidentContent>
    </>
  );
}
