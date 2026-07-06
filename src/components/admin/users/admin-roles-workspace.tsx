"use client";

import { Shield } from "lucide-react";
import { AdminSectionLabel } from "@/components/admin/ui/admin-primitives";
import type { AdminRoleDefinition } from "@/types";

interface AdminRolesWorkspaceProps {
  roles: AdminRoleDefinition[];
}

export function AdminRolesWorkspace({ roles }: AdminRolesWorkspaceProps) {
  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">
        Role definitions control what each user type can access in the Inspector and Resident portals.
      </p>
      <AdminSectionLabel>Permission matrix</AdminSectionLabel>
      <div className="grid gap-3 sm:grid-cols-2">
        {roles.map((role) => (
          <div
            key={role.id}
            className="admin-panel p-5 transition-shadow hover:shadow-md"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold">{role.label}</p>
                <p className="mt-1 text-sm text-muted-foreground">{role.description}</p>
                <p className="mt-2 inline-flex rounded-md bg-muted/50 px-2 py-0.5 text-xs text-muted-foreground">
                  Scope: {role.scope} · {role.permissions.length} permissions
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
