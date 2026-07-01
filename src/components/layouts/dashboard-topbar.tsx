"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { getApartment } from "@/lib/data";
import type { RoleNavConfig } from "@/config/navigation";
import { routes } from "@/config/routes";

interface DashboardTopbarProps {
  config: RoleNavConfig;
  title?: string;
  subtitle?: string;
}

export function DashboardTopbar({
  config,
  title,
  subtitle,
}: DashboardTopbarProps) {
  const apartment = getApartment();
  const isResident = config.role === "resident";

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex h-14 items-center gap-4 px-4 lg:px-6">
        <div className="min-w-0 flex-1">
          {title ? (
            <>
              <p className="truncate text-xs text-muted-foreground">
                {apartment.name}
              </p>
              <h1 className="truncate text-base font-semibold">{title}</h1>
            </>
          ) : isResident ? (
            <>
              <p className="truncate text-sm font-semibold">
                {config.userDisplayName}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {config.userSubtitle} · {apartment.name}
              </p>
            </>
          ) : config.role === "inspector" ? (
            <>
              <p className="truncate text-sm font-semibold">{apartment.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                Inspector · Read-only
              </p>
            </>
          ) : (
            <>
              <p className="truncate text-sm font-semibold">{config.label}</p>
              {subtitle && (
                <p className="truncate text-xs text-muted-foreground">
                  {subtitle}
                </p>
              )}
            </>
          )}
        </div>

        {isResident ? (
          <ButtonLink
            href={`${routes.dashboard.resident.root}/notices`}
            variant="outline"
            size="sm"
            className="shrink-0 gap-1.5"
          >
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Announcements</span>
          </ButtonLink>
        ) : (
          <Button
            variant="outline"
            size="icon"
            className="relative h-9 w-9 shrink-0"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
          </Button>
        )}
      </div>
    </header>
  );
}
