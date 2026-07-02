"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DOCUMENTS_NAV_MODULES } from "@/config/documents-workspace";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";

export function DocumentsNav() {
  const pathname = usePathname();

  return (
    <nav className="scroll-tabs">
      {DOCUMENTS_NAV_MODULES.map((tab) => {
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
