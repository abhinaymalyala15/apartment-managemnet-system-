import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const STAT_ACCENTS = {
  primary: {
    bar: "bg-primary",
    icon: "bg-primary/15 text-primary",
    glow: "from-primary/5",
  },
  success: {
    bar: "bg-emerald-500",
    icon: "bg-emerald-500/15 text-emerald-600",
    glow: "from-emerald-500/8",
  },
  warning: {
    bar: "bg-amber-500",
    icon: "bg-amber-500/15 text-amber-600",
    glow: "from-amber-500/8",
  },
  danger: {
    bar: "bg-red-500",
    icon: "bg-red-500/15 text-red-600",
    glow: "from-red-500/8",
  },
  muted: {
    bar: "bg-slate-300 dark:bg-slate-600",
    icon: "bg-slate-500/10 text-slate-600",
    glow: "from-slate-500/5",
  },
} as const;

export function AdminSectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
      {children}
    </h2>
  );
}

export function AdminStatCard({
  label,
  value,
  icon: Icon,
  accent = "primary",
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: keyof typeof STAT_ACCENTS;
}) {
  const style = STAT_ACCENTS[accent];

  return (
    <div
      className={cn(
        "admin-stat-card relative overflow-hidden",
        "bg-gradient-to-br to-white",
        style.glow
      )}
    >
      <div className={cn("absolute inset-y-0 left-0 w-1 rounded-l-2xl", style.bar)} />
      <div className="flex items-start justify-between gap-3 pl-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            {label}
          </p>
          <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight text-slate-900">
            {value}
          </p>
        </div>
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
            style.icon
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

export function AdminPanel({
  title,
  description,
  action,
  children,
  className,
  flush,
  tone = "default",
}: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  flush?: boolean;
  tone?: "default" | "primary" | "muted";
}) {
  const headerTone = {
    default: "bg-slate-50/90 border-slate-200/80",
    primary: "bg-primary/[0.06] border-primary/15",
    muted: "bg-white border-slate-200/80",
  }[tone];

  return (
    <section className={cn("admin-panel", className)}>
      {(title || description || action) && (
        <div
          className={cn(
            "flex flex-wrap items-start justify-between gap-3 border-b px-5 py-4",
            headerTone
          )}
        >
          <div>
            {title && <h2 className="text-base font-semibold text-slate-900">{title}</h2>}
            {description && (
              <p className="mt-0.5 text-sm text-slate-500">{description}</p>
            )}
          </div>
          {action}
        </div>
      )}
      <div className={cn(!flush && "p-5")}>{children}</div>
    </section>
  );
}

export function AdminWorkspaceIntro({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="admin-intro-card flex gap-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
        <Icon className="h-6 w-6" />
      </div>
      <div className="min-w-0">
        <p className="font-semibold text-slate-900">{title}</p>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">{children}</p>
      </div>
    </div>
  );
}

export function AdminHintBanner({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300/80 bg-slate-50 px-5 py-4 text-sm text-slate-600">
      {children}
    </div>
  );
}

export function AdminAvatar({ name }: { name: string }) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 text-sm font-bold text-white shadow-md">
      {initial}
    </div>
  );
}

export function AdminMetaChip({
  icon: Icon,
  children,
}: {
  icon?: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 shadow-sm">
      {Icon && <Icon className="h-3.5 w-3.5 text-slate-400" />}
      {children}
    </span>
  );
}

export function AdminBulkCard({
  icon: Icon,
  title,
  children,
  tone = "blue",
}: {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
  tone?: "blue" | "violet";
}) {
  const tones = {
    blue: "border-blue-200/80 bg-gradient-to-br from-blue-50/80 to-white",
    violet: "border-violet-200/80 bg-gradient-to-br from-violet-50/80 to-white",
  };

  return (
    <div className={cn("rounded-2xl border p-5 shadow-sm", tones[tone])}>
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
        <Icon className="h-4 w-4 text-primary" />
        {title}
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}
