"use client";

import { Shield } from "lucide-react";
import type { AdminRoleDefinition } from "@/types";

interface AdminRolesWorkspaceProps {
  roles: AdminRoleDefinition[];
}

export function AdminRolesWorkspace({ roles }: AdminRolesWorkspaceProps) {
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Role definitions control what each user type can access in the Inspector and Resident portals.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {roles.map((role) => (
          <div key={role.id} className="surface-card p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Shield className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">{role.label}</p>
                <p className="mt-1 text-sm text-muted-foreground">{role.description}</p>
                <p className="mt-2 text-xs text-muted-foreground">
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
