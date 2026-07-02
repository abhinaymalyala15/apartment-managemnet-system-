"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SETTINGS_NAV_MODULES } from "@/config/settings-workspace";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav className="scroll-tabs">
      {SETTINGS_NAV_MODULES.map((tab) => {
        if (!tab.enabled) return null;

        const active = pathname.startsWith(tab.href);

        return (
          <Link
            key={tab.id}
            href={tab.href}
            className={cn(
              "shrink-0 border-b-2 px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
