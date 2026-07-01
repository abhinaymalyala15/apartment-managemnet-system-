import { cn } from "@/lib/utils";

interface ResidentContentProps {
  children: React.ReactNode;
  className?: string;
}

export function ResidentContent({ children, className }: ResidentContentProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-3xl flex-1 space-y-6 p-4 sm:space-y-8 sm:p-6 lg:px-8",
        className
      )}
    >
      {children}
    </div>
  );
}
