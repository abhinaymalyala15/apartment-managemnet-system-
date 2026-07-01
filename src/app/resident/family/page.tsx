import { ResidentPageHeader } from "@/components/resident/resident-page-header";
import { ResidentContent } from "@/components/resident/resident-content";
import { getResidentContext } from "@/lib/resident-context";
import { formatDate } from "@/lib/data";
import { User } from "lucide-react";

export default function ResidentFamilyPage() {
  const { resident, family } = getResidentContext();
  const allMembers = [
    {
      id: resident.id,
      name: resident.fullName,
      role: "You · primary resident",
      phone: resident.phone,
      email: resident.email,
    },
    ...family.map((m) => ({
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
    })),
  ];

  return (
    <>
      <ResidentPageHeader
        title="Family"
        description={`${allMembers.length} people registered at your flat.`}
      />

      <ResidentContent className="space-y-3">
        {allMembers.map((member, index) => (
          <div
            key={member.id}
            className="flex gap-4 rounded-2xl border bg-card p-4 shadow-sm"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-sm font-semibold text-amber-800">
              {index === 0 ? (
                <User className="h-5 w-5" />
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
                {member.phone && <p>{member.phone}</p>}
                {member.email && <p>{member.email}</p>}
                {"extra" in member && member.extra && <p>{member.extra}</p>}
              </div>
            </div>
          </div>
        ))}
      </ResidentContent>
    </>
  );
}
