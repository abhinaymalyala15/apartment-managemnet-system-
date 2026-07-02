"use client";

import { cn } from "@/lib/utils";

interface FlatOpsSectionProps {
  id: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function FlatOpsSection({
  id,
  title,
  description,
  actions,
  children,
  className,
}: FlatOpsSectionProps) {
  return (
    <section id={id} className={cn("scroll-mt-24", className)}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold tracking-tight">{title}</h2>
          {description && (
            <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
      </div>
      <div className="surface-card p-4 sm:p-5">{children}</div>
    </section>
  );
}

interface FlatOpsFieldProps {
  label: string;
  value: React.ReactNode;
  className?: string;
}

export function FlatOpsField({ label, value, className }: FlatOpsFieldProps) {
  return (
    <div className={className}>
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium">{value}</dd>
    </div>
  );
}
