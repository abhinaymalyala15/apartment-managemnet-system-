"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Wallet, Bell, Wrench, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { routes } from "@/config/routes";

const root = routes.dashboard.resident.root;

/** Mobile-first nav — plain labels, 44px+ touch targets, thumb-friendly bottom bar */
const tabs = [
  { label: "Home", href: root, icon: Home, match: [root] },
  {
    label: "Bills",
    href: `${root}/payments`,
    icon: Wallet,
    match: [`${root}/payments`],
  },
  {
    label: "Notices",
    href: `${root}/notices`,
    icon: Bell,
    match: [`${root}/notices`],
  },
  {
    label: "Visits",
    href: `${root}/services`,
    icon: Wrench,
    match: [`${root}/services`],
  },
  {
    label: "My details",
    href: `${root}/profile`,
    icon: User,
    match: [`${root}/profile`, `${root}/flat`, `${root}/family`, `${root}/timeline`],
  },
];

export function ResidentBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/98 backdrop-blur-lg supports-[backdrop-filter]:bg-background/95 lg:hidden"
      aria-label="Main navigation"
    >
      <div className="mx-auto flex min-h-[4.25rem] max-w-lg items-stretch justify-around px-1 pb-[env(safe-area-inset-bottom)] pt-1">
        {tabs.map((tab) => {
          const isActive = tab.match.some(
            (path) => pathname === path || pathname.startsWith(`${path}/`)
          );

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex min-h-11 min-w-[3.5rem] flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 text-xs font-medium transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground active:bg-muted/60"
              )}
            >
              <span
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl transition-colors",
                  isActive && "bg-primary/10"
                )}
              >
                <tab.icon className="h-5 w-5" strokeWidth={isActive ? 2.25 : 2} />
              </span>
              <span className="max-w-[4.5rem] truncate leading-tight">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
