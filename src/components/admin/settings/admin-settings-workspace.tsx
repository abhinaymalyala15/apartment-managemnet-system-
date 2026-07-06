"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AdminPanel,
  AdminSectionLabel,
} from "@/components/admin/ui/admin-primitives";
import type { AdminRoleDefinition, IntegrationDef, SystemPreferences } from "@/types";

interface AdminSettingsWorkspaceProps {
  preferences: SystemPreferences;
  integrations: IntegrationDef[];
  roles: AdminRoleDefinition[];
}

export function AdminSettingsWorkspace({
  preferences,
  integrations,
  roles,
}: AdminSettingsWorkspaceProps) {
  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            System-wide preferences — theme, language, financial year, and notification channels.
          </p>
          <Button size="sm">Edit preferences</Button>
        </div>
        <AdminPanel>
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ["Timezone", preferences.timezone],
              ["Date format", preferences.dateFormat],
              ["Currency", preferences.currency],
              ["Locale", preferences.locale],
              ["Financial year starts", `Month ${preferences.fiscalYearStartMonth}`],
              ["Default notice channel", preferences.defaultNoticeChannel],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-lg border border-border/50 bg-muted/20 px-3 py-2.5"
              >
                <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
                <dd className="mt-0.5 text-sm font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
        </AdminPanel>
      </section>

      <section className="space-y-3">
        <AdminSectionLabel>Integrations</AdminSectionLabel>
        <div className="admin-panel divide-y">
          {integrations.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-4 px-4 py-3.5 sm:px-5"
            >
              <div>
                <p className="font-medium">{item.label}</p>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
              <Badge variant={item.enabled ? "default" : "outline"} className="text-[10px]">
                {item.enabled ? "Enabled" : item.phase ?? "Disabled"}
              </Badge>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <AdminSectionLabel>Roles ({roles.length})</AdminSectionLabel>
        <p className="text-sm text-muted-foreground">
          Role definitions are managed under Users → Roles & permissions.
        </p>
      </section>
    </div>
  );
}
