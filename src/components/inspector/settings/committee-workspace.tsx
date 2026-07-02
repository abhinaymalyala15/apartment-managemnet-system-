"use client";

import { ContactCards } from "@/components/shared/contact-cards";
import { useSettingsActions } from "@/components/inspector/settings/settings-provider";
import { Button } from "@/components/ui/button";
import type { CommitteeMember } from "@/types";
import { Mail, Phone, UserPlus } from "lucide-react";

interface CommitteeWorkspaceProps {
  members: CommitteeMember[];
}

export function CommitteeWorkspace({ members }: CommitteeWorkspaceProps) {
  const { openAction } = useSettingsActions();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          RWA committee roster — visible to residents on family and dashboard pages.
        </p>
        <Button size="sm" onClick={() => openAction("add-committee")}>
          <UserPlus className="mr-1.5 h-4 w-4" />
          Add member
        </Button>
      </div>

      <div className="space-y-3">
        {members.map((member) => (
          <div key={member.id} className="surface-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{member.name}</p>
                <p className="text-sm text-primary">{member.role}</p>
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <a
                href={`tel:${member.phone.replace(/\s/g, "")}`}
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <Phone className="h-3.5 w-3.5" />
                {member.phone}
              </a>
              <a
                href={`mailto:${member.email}`}
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <Mail className="h-3.5 w-3.5" />
                {member.email}
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface ContactsWorkspaceProps {
  contacts: import("@/types").CommitteeContacts;
}

export function ContactsWorkspace({ contacts }: ContactsWorkspaceProps) {
  const { openAction } = useSettingsActions();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          Emergency and society office contacts for residents and staff.
        </p>
        <Button size="sm" onClick={() => openAction("add-emergency")}>
          <UserPlus className="mr-1.5 h-4 w-4" />
          Add emergency contact
        </Button>
      </div>
      <ContactCards contacts={contacts} variant="full" />
    </div>
  );
}
