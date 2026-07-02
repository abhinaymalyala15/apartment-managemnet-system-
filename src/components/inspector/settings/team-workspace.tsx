"use client";

import { useSettingsActions } from "@/components/inspector/settings/settings-provider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { AdminRoleDefinition, StaffMember } from "@/types";
import { Mail, Phone, Shield, UserPlus } from "lucide-react";

type EnrichedStaff = StaffMember & { roleLabel: string; blockLabels: string };

interface TeamWorkspaceProps {
  staff: EnrichedStaff[];
  roles: AdminRoleDefinition[];
}

export function TeamWorkspace({ staff, roles }: TeamWorkspaceProps) {
  const { openAction } = useSettingsActions();
  const activeStaff = staff.filter((s) => s.isActive);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          Office staff with role-based access. Block scope limits operational visibility.
        </p>
        <Button size="sm" onClick={() => openAction("add-staff")}>
          <UserPlus className="mr-1.5 h-4 w-4" />
          Add staff
        </Button>
      </div>

      <section className="space-y-3">
        <h2 className="font-semibold">Staff roster</h2>
        {activeStaff.map((member) => (
          <div key={member.id} className="surface-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{member.fullName}</p>
                <p className="text-sm text-muted-foreground">
                  {member.roleLabel} · {member.department}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Scope: {member.blockLabels} · Joined{" "}
                  {new Date(member.joinedAt).toLocaleDateString("en-IN", {
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
              <Badge variant="outline">{member.roleLabel}</Badge>
            </div>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
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
      </section>

      <section>
        <h2 className="flex items-center gap-2 font-semibold">
          <Shield className="h-4 w-4 text-primary" />
          Roles & permissions
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Future RBAC — permissions attach to roles, not individual users.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {roles.map((role) => (
            <div key={role.id} className="surface-card p-4">
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium">{role.label}</p>
                <Badge variant="secondary" className="text-[10px] capitalize">
                  {role.scope}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {role.description}
              </p>
              <div className="mt-3 flex flex-wrap gap-1">
                {role.permissions.map((perm) => (
                  <Badge key={perm} variant="outline" className="text-[10px]">
                    {perm.replace(/_/g, " ")}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
