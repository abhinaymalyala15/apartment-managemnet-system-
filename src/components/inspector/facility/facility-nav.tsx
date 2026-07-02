"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { routes } from "@/config/routes";
import { FACILITY_NAV_MODULES } from "@/config/facility-workspace";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const routeMap: Record<string, string> = {
  schedule: routes.dashboard.inspector.services.schedule,
  staff: routes.dashboard.inspector.services.staff,
  vendors: routes.dashboard.inspector.services.vendors,
  assets: routes.dashboard.inspector.services.assets,
};

export function ServicesNav() {
  const pathname = usePathname();

  return (
    <nav className="scroll-tabs">
      {FACILITY_NAV_MODULES.map((tab) => {
        if (!tab.enabled && !tab.href) {
          return (
            <span
              key={tab.id}
              className="flex shrink-0 items-center gap-1 border-b-2 border-transparent px-3 py-2 text-sm text-muted-foreground/60"
            >
              {tab.label}
              {tab.phase && (
                <Badge variant="outline" className="text-[10px]">
                  {tab.phase}
                </Badge>
              )}
            </span>
          );
        }
        const href = tab.href ?? routeMap[tab.id];
        if (!href) return null;

        const active = pathname.startsWith(href);

        return (
          <Link
            key={tab.id}
            href={href}
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
