import { ResidentPageHeader } from "@/components/resident/resident-page-header";
import { ResidentContent } from "@/components/resident/resident-content";
import { getResidentContext } from "@/lib/resident-context";
import { formatDate, getCommitteeContacts } from "@/lib/data";
import { EmptyState } from "@/components/ui/empty-state";
import { Users, Phone } from "lucide-react";

export default function ResidentFamilyPage() {
  const { resident, family } = getResidentContext();
  const contacts = getCommitteeContacts();

  const familyOnly = family.map((m) => ({
    id: m.id,
    name: m.fullName,
    role: m.relationship,
    phone: m.phone,
    email: m.email,
    extra: m.dateOfBirth
      ? `Born ${formatDate(m.dateOfBirth)}`
      : m.marriageAnniversary
        ? `Anniversary ${formatDate(m.marriageAnniversary)}`
        : undefined,
  }));

  const allMembers = [
    {
      id: resident.id,
      name: resident.fullName,
      role: "You · primary resident",
      phone: resident.phone,
      email: resident.email,
    },
    ...familyOnly,
  ];

  return (
    <>
      <ResidentPageHeader
        title="Family"
        description={`${allMembers.length} people registered at your flat. Updates are managed by the society office.`}
      />

      <ResidentContent className="space-y-3">
        {familyOnly.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Only you are registered"
            description="Family members added by the society office will appear here. Contact the office to request an update."
            action={
              <a
                href={`tel:${contacts.office.phone.replace(/\s/g, "")}`}
                className="inline-flex items-center gap-2 rounded-lg border bg-card px-4 py-2 text-sm font-medium shadow-sm hover:bg-muted"
              >
                <Phone className="h-4 w-4" />
                Call society office
              </a>
            }
          />
        ) : null}

        {allMembers.map((member, index) => (
          <div key={member.id} className="surface-card flex gap-4 p-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              {index === 0 ? (
                <Users className="h-5 w-5" />
              ) : (
                member.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium">{member.name}</p>
              <p className="text-sm text-muted-foreground">{member.role}</p>
              <div className="mt-2 space-y-0.5 text-sm text-muted-foreground">
                {member.phone && (
                  <a href={`tel:${member.phone.replace(/\s/g, "")}`} className="block text-primary hover:underline">
                    {member.phone}
                  </a>
                )}
                {member.email && (
                  <a href={`mailto:${member.email}`} className="block hover:underline">
                    {member.email}
                  </a>
                )}
                {"extra" in member && member.extra && <p>{member.extra}</p>}
              </div>
            </div>
          </div>
        ))}
      </ResidentContent>
    </>
  );
}
