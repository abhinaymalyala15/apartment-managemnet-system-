"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AdminTopbarToday } from "@/components/inspector/admin-topbar-today";
import { LiveClock } from "@/components/inspector/live-clock";
import type { AdminTopbarSummary } from "@/lib/admin-data";
import { roleNavigation } from "@/config/navigation";
import { routes } from "@/config/routes";

interface AdminTopbarProps {
  apartmentName: string;
  todayLabel: string;
  topbarSummary: AdminTopbarSummary;
}

export function AdminTopbar({
  apartmentName,
  todayLabel,
  topbarSummary,
}: AdminTopbarProps) {
  const config = roleNavigation.inspector;
  const initials = config.userDisplayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="border-b bg-muted/20 px-4 py-2.5 lg:px-6">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-semibold tracking-tight">
              {apartmentName}
            </p>
            <p className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
              <span>{todayLabel}</span>
              <span aria-hidden>·</span>
              <LiveClock />
            </p>
          </div>

          <div className="hidden items-center gap-3 sm:flex">
            <Avatar size="sm">
              <AvatarFallback className="text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {config.userDisplayName}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                Apartment Inspector
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:gap-4 lg:px-6">
        <AdminTopbarToday summary={topbarSummary} />

        <div className="flex shrink-0 items-center sm:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring sm:hidden">
              <Avatar size="sm">
                <AvatarFallback className="text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <p className="font-medium">{config.userDisplayName}</p>
                <p className="text-xs font-normal text-muted-foreground">
                  Apartment Inspector
                </p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                render={<a href={routes.public.login} className="w-full" />}
              >
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
