"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";

const tabs = [
  { label: "Open", href: routes.dashboard.inspector.complaints.open },
  { label: "In progress", href: routes.dashboard.inspector.complaints.inProgress },
  { label: "Resolved", href: routes.dashboard.inspector.complaints.resolved },
];

export function ComplaintsNav() {
  const pathname = usePathname();

  return (
    <nav className="scroll-tabs">
      {tabs.map((tab) => {
        const active = pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
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
