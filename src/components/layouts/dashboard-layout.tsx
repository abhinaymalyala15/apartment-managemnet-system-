"use client";

import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { DashboardSidebar } from "./dashboard-sidebar";
import { DashboardTopbar } from "./dashboard-topbar";
import type { DashboardRole } from "@/config/routes";
import { roleNavigation } from "@/config/navigation";
import { appConfig } from "@/config/app";

interface DashboardLayoutProps {
  role: DashboardRole;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function DashboardLayout({ role, children, footer }: DashboardLayoutProps) {
  const navConfig = roleNavigation[role];
  const isResident = role === "resident";
  const isInspector = role === "inspector";

  return (
    <div
      className={
        isResident
          ? "flex min-h-screen bg-[oklch(0.975_0.008_85)]"
          : isInspector
            ? "flex min-h-screen bg-[oklch(0.985_0.004_260)]"
            : "flex min-h-screen bg-[oklch(0.97_0.006_260)]"
      }
    >
      <aside className="hidden w-60 shrink-0 flex-col border-r bg-card lg:flex">
        <DashboardSidebar config={navConfig} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-14 items-center gap-3 border-b bg-background px-4 lg:hidden">
          <Sheet>
            <SheetTrigger
              className="inline-flex size-9 items-center justify-center rounded-lg border border-border bg-background hover:bg-muted"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="left" className="w-60 p-0">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <div className="flex h-full flex-col">
                <DashboardSidebar config={navConfig} />
              </div>
            </SheetContent>
          </Sheet>
          <span className="text-sm font-semibold">{appConfig.name}</span>
        </div>

        {!isInspector && <DashboardTopbar config={navConfig} />}
        <main
          className={
            footer
              ? "flex min-h-0 flex-1 flex-col pb-[calc(4.25rem+env(safe-area-inset-bottom))] lg:pb-0"
              : "flex min-h-0 flex-1 flex-col"
          }
        >
          {children}
        </main>
        {footer}
      </div>
    </div>
  );
}
