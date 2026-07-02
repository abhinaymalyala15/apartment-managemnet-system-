import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { ReportScopeContext } from "@/types";

interface ReportScopeBarProps {
  context: ReportScopeContext;
}

export function ReportScopeBar({ context }: ReportScopeBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2 text-sm">
      <span className="text-muted-foreground">Scope:</span>
      <nav className="flex flex-wrap items-center gap-1">
        {context.breadcrumbs.map((crumb, i) => (
          <span key={crumb.href} className="flex items-center gap-1">
            {i > 0 && (
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            )}
            {i === context.breadcrumbs.length - 1 ? (
              <span className="font-medium">{crumb.label}</span>
            ) : (
              <Link
                href={crumb.href}
                className="text-primary hover:underline"
              >
                {crumb.label}
              </Link>
            )}
          </span>
        ))}
      </nav>
    </div>
  );
}
