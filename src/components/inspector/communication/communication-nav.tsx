"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";
const tabs = [
  { label: "Published", href: routes.dashboard.inspector.notices.published },
  { label: "Drafts", href: routes.dashboard.inspector.notices.drafts },
  { label: "Scheduled", href: routes.dashboard.inspector.notices.scheduled },
  { label: "Archived", href: routes.dashboard.inspector.notices.archived },
];
export function NoticesNav() {
  const pathname = usePathname();
  return (
    <nav className="scroll-tabs">
      {tabs.map((tab) => (
        <Link key={tab.href} href={tab.href} className={cn("shrink-0 border-b-2 px-3 py-2 text-sm font-medium transition-colors", pathname.startsWith(tab.href) ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground")}>
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
