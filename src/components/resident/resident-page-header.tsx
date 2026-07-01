import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResidentPageHeaderProps {
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
  showBack?: boolean;
  className?: string;
}

export function ResidentPageHeader({
  title,
  description,
  backHref = "/resident",
  backLabel = "Back to home",
  showBack = true,
  className,
}: ResidentPageHeaderProps) {
  return (
    <div
      className={cn(
        "border-b bg-background/80 px-4 py-4 backdrop-blur-sm sm:px-6 lg:px-8",
        className
      )}
    >
      {showBack && (
        <Link
          href={backHref}
          className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          {backLabel}
        </Link>
      )}
      <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
        {title}
      </h1>
      {description && (
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
}
