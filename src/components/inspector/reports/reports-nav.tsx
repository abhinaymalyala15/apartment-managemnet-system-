"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { REPORT_DEFINITIONS } from "@/config/reports-workspace";
import { cn } from "@/lib/utils";

export function ReportsNav() {
  const pathname = usePathname();

  return (
    <nav className="scroll-tabs">
      {REPORT_DEFINITIONS.map((report) => (
        <Link
          key={report.id}
          href={report.href}
          className={cn(
            "shrink-0 border-b-2 px-3 py-2 text-sm font-medium transition-colors",
            pathname.startsWith(report.href)
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          {report.label}
        </Link>
      ))}
    </nav>
  );
}
