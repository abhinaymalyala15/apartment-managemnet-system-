import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface PageSectionProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export function PageSection({
  title,
  description,
  icon: Icon,
  action,
  children,
  className,
  noPadding,
}: PageSectionProps) {
  return (
    <section className={cn("rounded-xl border bg-card shadow-sm", className)}>
      <div className="flex items-start justify-between gap-4 border-b px-5 py-4 sm:px-6">
        <div className="flex items-start gap-3">
          {Icon && (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Icon className="h-4 w-4 text-primary" />
            </div>
          )}
          <div>
            <h3 className="font-semibold leading-tight">{title}</h3>
            {description && (
              <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
        {action}
      </div>
      <div className={cn(!noPadding && "p-5 sm:p-6")}>{children}</div>
    </section>
  );
}
