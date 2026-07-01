"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Wallet, Bell, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { routes } from "@/config/routes";

const root = routes.dashboard.resident.root;

const tabs = [
  { label: "Home", href: root, icon: Home },
  { label: "Bills", href: `${root}/payments`, icon: Wallet },
  { label: "News", href: `${root}/notices`, icon: Bell },
  { label: "Account", href: `${root}/profile`, icon: User },
];

export function ResidentBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 backdrop-blur-lg lg:hidden"
      aria-label="Main navigation"
    >
      <div className="mx-auto flex h-16 max-w-lg items-stretch justify-around px-2 pb-[env(safe-area-inset-bottom)]">
        {tabs.map((tab) => {
          const isActive =
            pathname === tab.href ||
            (tab.href !== root && pathname.startsWith(tab.href));

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex min-w-[4rem] flex-1 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-medium transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-xl transition-colors",
                  isActive && "bg-primary/10"
                )}
              >
                <tab.icon className="h-5 w-5" />
              </span>
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
