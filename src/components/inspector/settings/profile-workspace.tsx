"use client";

import { useSettingsActions } from "@/components/inspector/settings/settings-provider";
import { Button } from "@/components/ui/button";
import type { Apartment } from "@/types";
import { Building2, Mail, MapPin, Phone } from "lucide-react";

interface ProfileWorkspaceProps {
  profile: Apartment;
}

export function ProfileWorkspace({ profile }: ProfileWorkspaceProps) {
  const { openAction } = useSettingsActions();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          Society identity shown on public website and resident portal.
        </p>
        <Button size="sm" onClick={() => openAction("edit-profile")}>
          Edit profile
        </Button>
      </div>

      <div className="surface-card p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">{profile.name}</h2>
            <p className="text-sm text-muted-foreground">{profile.tagline}</p>
          </div>
        </div>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          {[
            ["Registration", profile.registrationNumber],
            ["Established", String(profile.yearEstablished)],
            ["Blocks", String(profile.totalBlocks)],
            ["Flats", String(profile.totalFlats)],
            ["Floors", String(profile.totalFloors ?? "—")],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
              <dd className="mt-0.5 font-medium">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-6 space-y-3 border-t pt-6">
          <div className="flex items-start gap-2 text-sm">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <span>
              {profile.address}, {profile.city}, {profile.state} {profile.pincode}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <a href={`tel:${profile.phone}`} className="text-primary hover:underline">
              {profile.phone}
            </a>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <a href={`mailto:${profile.email}`} className="text-primary hover:underline">
              {profile.email}
            </a>
          </div>
        </div>

        <p className="mt-6 text-sm text-muted-foreground">{profile.description}</p>
      </div>
    </div>
  );
}
