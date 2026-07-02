"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { StaffMember } from "@/types";

interface AdminUsersListWorkspaceProps {
  title: string;
  description: string;
  members: Array<StaffMember & { roleLabel: string; blockLabels: string }>;
  emptyLabel?: string;
}

export function AdminUsersListWorkspace({
  title,
  description,
  members,
  emptyLabel = "No accounts in this category yet.",
}: AdminUsersListWorkspaceProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Button size="sm">Add {title.toLowerCase()}</Button>
      </div>

      {members.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-muted/20 px-6 py-10 text-center text-sm text-muted-foreground">
          {emptyLabel}
        </div>
      ) : (
        <div className="surface-card overflow-hidden">
          <ul className="divide-y">
            {members.map((member) => (
              <li
                key={member.id}
                className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{member.fullName}</p>
                    {!member.isActive && (
                      <Badge variant="outline" className="text-[10px]">
                        Inactive
                      </Badge>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {member.roleLabel} · {member.department}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {member.email} · {member.phone}
                  </p>
                </div>
                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                  <Button variant="outline" size="sm" className="w-full sm:w-auto">
                    Reset password
                  </Button>
                  <Button variant="outline" size="sm" className="w-full sm:w-auto">
                    Edit
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
