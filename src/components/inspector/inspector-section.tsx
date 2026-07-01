import { cn } from "@/lib/utils";

interface InspectorSectionProps {
  title: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}

export function InspectorSection({
  title,
  hint,
  children,
  className,
}: InspectorSectionProps) {
  return (
    <section className={cn("space-y-3", className)}>
      <div>
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        {hint && (
          <p className="mt-0.5 text-sm text-muted-foreground">{hint}</p>
        )}
      </div>
      {children}
    </section>
  );
}
