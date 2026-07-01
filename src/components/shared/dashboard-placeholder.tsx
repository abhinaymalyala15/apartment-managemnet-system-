import { cn } from "@/lib/utils";

interface DashboardPlaceholderProps {
  title: string;
  description: string;
  phase: number;
  phaseName: string;
  children?: React.ReactNode;
}

export function DashboardPlaceholder({
  title,
  description,
  phase,
  phaseName,
  children,
}: DashboardPlaceholderProps) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="border-b bg-background px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs font-medium uppercase tracking-wider text-primary">
            Phase {phase} — {phaseName}
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            {title}
          </h1>
          <p className="mt-3 text-muted-foreground">{description}</p>
        </div>
      </div>

      <div className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          {children ?? (
            <div
              className={cn(
                "rounded-xl border border-dashed bg-muted/30 p-8 text-center",
                "text-sm text-muted-foreground"
              )}
            >
              <p className="font-medium text-foreground">
                Business modules coming in Phase {phase}
              </p>
              <p className="mt-2">
                The dashboard shell, sidebar, and navigation are ready. Module
                content will be built after Phase {phase - 1} approval.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
