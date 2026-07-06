"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { DashboardSidebar } from "./dashboard-sidebar";
import { DashboardTopbar } from "./dashboard-topbar";
import type { DashboardRole } from "@/config/routes";
import type { RoleNavConfig } from "@/config/navigation";
import { roleNavigation } from "@/config/navigation";
import { appConfig } from "@/config/app";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  role: DashboardRole;
  children: React.ReactNode;
  footer?: React.ReactNode;
  topbarSlot?: React.ReactNode;
  navConfig?: RoleNavConfig;
}

export function DashboardLayout({ role, children, footer, topbarSlot, navConfig: navConfigProp }: DashboardLayoutProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const navConfig = navConfigProp ?? roleNavigation[role];
  const isResident = role === "resident";
  const isInspector = role === "inspector";
  const isAdmin = role === "admin";

  return (
    <div
      className={cn(
        "flex min-h-screen overflow-x-hidden",
        isResident
          ? "bg-[oklch(0.975_0.008_85)]"
          : isInspector
            ? "bg-[oklch(0.985_0.004_260)]"
            : "bg-[oklch(0.97_0.006_260)]"
      )}
    >
      <aside
        className={cn(
          "hidden shrink-0 flex-col lg:flex",
          isAdmin
            ? "w-64 border-r border-slate-800 bg-slate-900 text-slate-100"
            : "w-60 border-r bg-card"
        )}
      >
        <DashboardSidebar config={navConfig} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <div
          className={cn(
            "flex h-14 items-center gap-3 border-b px-4 lg:hidden",
            isAdmin ? "border-slate-800 bg-slate-900 text-white" : "bg-background"
          )}
        >
          <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
            <SheetTrigger
              className={cn(
                "inline-flex size-10 items-center justify-center rounded-lg border hover:bg-muted",
                isAdmin
                  ? "border-slate-700 bg-slate-800 text-white hover:bg-slate-700"
                  : "border-border bg-background"
              )}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent
              side="left"
              className={cn(
                "w-[min(100vw,16rem)] p-0",
                isAdmin && "border-slate-800 bg-slate-900 text-slate-100"
              )}
            >
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <div className="flex h-full flex-col">
                <DashboardSidebar
                  config={navConfig}
                  onNavigate={() => setMobileNavOpen(false)}
                />
              </div>
            </SheetContent>
          </Sheet>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">
              {isResident ? navConfig.userDisplayName : appConfig.name}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {isResident ? navConfig.userSubtitle : navConfig.label}
            </p>
          </div>
        </div>

        {!isInspector && (
          <>
            <div className="hidden lg:block">
              <DashboardTopbar config={navConfig} />
            </div>
            {(isAdmin || isResident) && (
              <div className="border-b bg-background px-4 py-2.5 lg:hidden">
                <p className="truncate text-sm font-semibold">{navConfig.userDisplayName}</p>
                <p className="truncate text-xs text-muted-foreground">{navConfig.userSubtitle}</p>
              </div>
            )}
          </>
        )}
        {isInspector && (
          <DashboardTopbar config={navConfig} centerSlot={topbarSlot} />
        )}
        <main
          className={cn(
            "flex min-h-0 flex-1 flex-col overflow-x-hidden",
            isAdmin && "admin-portal-main portal-content",
            !isAdmin && footer && "pb-[calc(4.25rem+env(safe-area-inset-bottom))] lg:pb-0",
            isAdmin && footer && "pb-[calc(4.25rem+env(safe-area-inset-bottom))] lg:pb-0"
          )}
        >
          {children}
        </main>
        {footer}
      </div>
    </div>
  );
}
