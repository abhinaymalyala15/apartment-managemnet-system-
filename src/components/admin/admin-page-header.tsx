import { cn } from "@/lib/utils";

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function AdminPageHeader({
  title,
  description,
  action,
  className,
}: AdminPageHeaderProps) {
  return (
    <header
      className={cn(
        "relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white px-5 py-5 shadow-[0_4px_20px_rgb(0,0,0,0.04)] sm:px-6",
        className
      )}
    >
      <div className="absolute inset-y-0 left-0 w-1.5 bg-primary" />
      <div className="flex flex-wrap items-end justify-between gap-4 pl-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
            Apartment Admin
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-[1.75rem]">
            {title}
          </h1>
          {description && (
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-600">
              {description}
            </p>
          )}
        </div>
        {action}
      </div>
    </header>
  );
}
