import { cn } from "@/lib/utils";

interface InspectorShellProps {
  children: React.ReactNode;
  className?: string;
  narrow?: boolean;
}

export function InspectorShell({
  children,
  className,
  narrow = false,
}: InspectorShellProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8",
        narrow ? "max-w-3xl" : "max-w-7xl",
        className
      )}
    >
      {children}
    </div>
  );
}
