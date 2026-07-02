"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ACCOUNTING_NAV_MODULES } from "@/config/accounting-workspace";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
export function MaintenanceNav() {
  const pathname = usePathname();
  return (
    <nav className="scroll-tabs">
      {ACCOUNTING_NAV_MODULES.map((tab) => {
        if (!tab.enabled && !tab.href) {
          return (
            <span key={tab.id} className="flex shrink-0 items-center gap-1.5 border-b-2 border-transparent px-3 py-2 text-sm text-muted-foreground/60">
              {tab.label}
              {tab.phase && <Badge variant="outline" className="text-[10px]">{tab.phase}</Badge>}
            </span>
          );
        }
        if (!tab.href) return null;
        return (
          <Link key={tab.id} href={tab.href} className={cn("shrink-0 border-b-2 px-3 py-2 text-sm font-medium transition-colors", pathname.startsWith(tab.href) ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground")}>
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
