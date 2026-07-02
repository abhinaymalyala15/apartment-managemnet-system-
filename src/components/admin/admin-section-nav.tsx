"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export interface AdminSectionNavItem {
  id: string;
  label: string;
  href: string;
}

interface AdminSectionNavProps {
  items: AdminSectionNavItem[];
}

export function AdminSectionNav({ items }: AdminSectionNavProps) {
  const pathname = usePathname();

  return (
    <nav className="scroll-tabs">
      {items.map((tab) => {
        const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);

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
