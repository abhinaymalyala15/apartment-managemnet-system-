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
    <nav className="inline-flex w-full max-w-full gap-1 overflow-x-auto rounded-2xl border border-slate-200/80 bg-slate-100/80 p-1.5 shadow-inner">
      {items.map((tab) => {
        const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);

        return (
          <Link
            key={tab.id}
            href={tab.href}
            className={cn(
              "shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all",
              active
                ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/80"
                : "text-slate-500 hover:bg-white/60 hover:text-slate-800"
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
