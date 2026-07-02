"use client";

import { useSettingsActions } from "@/components/inspector/settings/settings-provider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { IntegrationDef, SystemPreferences } from "@/types";
import { Plug, Settings2 } from "lucide-react";

interface PreferencesWorkspaceProps {
  preferences: SystemPreferences;
  integrations: IntegrationDef[];
}

export function PreferencesWorkspace({
  preferences,
  integrations,
}: PreferencesWorkspaceProps) {
  const { openAction } = useSettingsActions();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          System-wide defaults and integration readiness for future modules.
        </p>
        <Button size="sm" onClick={() => openAction("edit-preferences")}>
          <Settings2 className="mr-1.5 h-4 w-4" />
          Edit preferences
        </Button>
      </div>

      <div className="surface-card p-5">
        <h2 className="font-semibold">System preferences</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ["Timezone", preferences.timezone],
            ["Date format", preferences.dateFormat],
            ["Currency", preferences.currency],
            ["Locale", preferences.locale],
            ["Fiscal year starts", `Month ${preferences.fiscalYearStartMonth}`],
            ["Default notice channel", preferences.defaultNoticeChannel],
            ["Auto-archive notices", `${preferences.autoArchiveNoticesDays} days`],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs text-muted-foreground">{label}</dt>
              <dd className="mt-0.5 font-medium">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <section>
        <h2 className="flex items-center gap-2 font-semibold">
          <Plug className="h-4 w-4 text-primary" />
          Integrations
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Connect external services when backend is ready — UI architecture supports all.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {integrations.map((integration) => (
            <div
              key={integration.id}
              className="surface-card flex items-start justify-between gap-3 p-4"
            >
              <div>
                <p className="font-medium">{integration.label}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {integration.description}
                </p>
              </div>
              {integration.enabled ? (
                <Badge className="shrink-0">Active</Badge>
              ) : (
                <Badge variant="outline" className="shrink-0 text-[10px]">
                  {integration.phase ?? "Future"}
                </Badge>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
