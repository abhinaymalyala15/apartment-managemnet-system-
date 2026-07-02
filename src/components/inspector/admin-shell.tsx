"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronLeft, Menu, PanelLeft, PanelLeftClose } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { DashboardSidebar } from "@/components/layouts/dashboard-sidebar";
import { AdminGlobalSearch } from "@/components/inspector/admin-global-search";
import { AdminTopbar } from "@/components/inspector/admin-topbar";
import { AdminActionProvider } from "@/components/inspector/admin-action-provider";
import { AdminActionDrawers } from "@/components/inspector/admin-action-drawers";
import { ExplorerProvider } from "@/components/inspector/explorer/explorer-provider";
import { CommunityExplorer } from "@/components/inspector/explorer/community-explorer";
import { useExplorer } from "@/components/inspector/explorer/explorer-provider";
import { roleNavigation } from "@/config/navigation";
import { appConfig } from "@/config/app";
import type { AdminTopbarSummary } from "@/lib/admin-data";
import type { ExplorerBlockMeta } from "@/lib/explorer-data";
import { cn } from "@/lib/utils";

const EXPLORER_WIDTH = 280;

interface AdminShellProps {
  apartmentName: string;
  todayLabel: string;
  topbarSummary: AdminTopbarSummary;
  explorerBlocks: ExplorerBlockMeta[];
  totalFlats: number;
  children: React.ReactNode;
}

export function AdminShell(props: AdminShellProps) {
  return (
    <ExplorerProvider
      apartmentName={props.apartmentName}
      blocks={props.explorerBlocks}
      totalFlats={props.totalFlats}
    >
      <AdminActionProvider>
        <AdminShellInner {...props} />
        <AdminGlobalSearch showTrigger={false} />
        <AdminActionDrawers />
      </AdminActionProvider>
    </ExplorerProvider>
  );
}

function AdminShellInner({
  apartmentName,
  todayLabel,
  topbarSummary,
  children,
}: AdminShellProps) {
  const navConfig = roleNavigation.inspector;
  const {
    isDesktopOpen,
    toggleDesktop,
    isMobileOpen,
    setMobileOpen,
  } = useExplorer();
  const [navOpen, setNavOpen] = useState(false);

  const explorerWidth = isDesktopOpen ? EXPLORER_WIDTH : 0;

  return (
    <div
      className="admin-shell flex min-h-screen overflow-x-hidden bg-[oklch(0.975_0.006_260)]"
      style={{ ["--admin-explorer-width" as string]: `${explorerWidth}px` }}
    >
      {/* Desktop Community Explorer — resizable in future via this column */}
      <aside
        data-admin-explorer
        className={cn(
          "relative hidden shrink-0 overflow-hidden border-r bg-card transition-[width] duration-200 ease-out lg:flex lg:flex-col",
          isDesktopOpen ? "w-[280px]" : "w-0 border-r-0"
        )}
        style={{ width: isDesktopOpen ? EXPLORER_WIDTH : 0 }}
      >
        {isDesktopOpen && (
          <div className="flex h-full w-[280px] flex-col">
            <CommunityExplorer />
          </div>
        )}
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          onClick={toggleDesktop}
          className={cn(
            "absolute top-3 z-10 hidden size-7 lg:inline-flex",
            isDesktopOpen ? "right-2" : "-right-10"
          )}
          aria-label={isDesktopOpen ? "Collapse explorer" : "Expand explorer"}
          title="Toggle explorer (⌘B)"
        >
          {isDesktopOpen ? (
            <PanelLeftClose className="h-3.5 w-3.5" />
          ) : (
            <PanelLeft className="h-3.5 w-3.5" />
          )}
        </Button>
      </aside>

      {!isDesktopOpen && (
        <div className="relative hidden w-0 lg:block">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={toggleDesktop}
            className="absolute -left-px top-3 z-10 size-7 rounded-l-none border-l-0"
            aria-label="Expand explorer"
            title="Toggle explorer (⌘B)"
          >
            <PanelLeft className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      <aside className="hidden w-60 shrink-0 flex-col border-r bg-card lg:flex">
        <DashboardSidebar config={navConfig} />
      </aside>

      <div className="admin-main flex min-w-0 flex-1 flex-col">
        <div className="flex h-14 items-center gap-2 border-b bg-background px-4 lg:hidden">
          <Sheet open={isMobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              className="inline-flex size-9 items-center justify-center rounded-lg border border-border bg-background hover:bg-muted"
              aria-label="Open community explorer"
            >
              <PanelLeft className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="left" className="w-[min(100vw,280px)] p-0">
              <SheetTitle className="sr-only">Community Explorer</SheetTitle>
              <CommunityExplorer />
            </SheetContent>
          </Sheet>
          <Sheet open={navOpen} onOpenChange={setNavOpen}>
            <SheetTrigger
              className="inline-flex size-10 items-center justify-center rounded-lg border border-border bg-background hover:bg-muted"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="left" className="w-[min(100vw,15rem)] p-0">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <div className="flex h-full flex-col">
                <DashboardSidebar
                  config={navConfig}
                  onNavigate={() => setNavOpen(false)}
                />
              </div>
            </SheetContent>
          </Sheet>
          <span className="truncate text-sm font-semibold">{appConfig.name}</span>
        </div>

        <AdminTopbar
          apartmentName={apartmentName}
          todayLabel={todayLabel}
          topbarSummary={topbarSummary}
        />

        <main className="flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto">
          <div className="portal-content flex-1">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

interface AdminSubpageLayoutProps {
  title: string;
  description?: string;
  backHref: string;
  backLabel: string;
  children: React.ReactNode;
}

export function AdminSubpageLayout({
  title,
  description,
  backHref,
  backLabel,
  children,
}: AdminSubpageLayoutProps) {
  return (
    <div className="page-stack">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        {backLabel}
      </Link>
      <header className="space-y-1">
        <h1 className="page-title">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </header>
      {children}
    </div>
  );
}
