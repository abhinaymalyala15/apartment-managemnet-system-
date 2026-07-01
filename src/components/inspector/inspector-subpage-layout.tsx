import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { InspectorShell } from "./inspector-shell";
import { cn } from "@/lib/utils";

interface InspectorSubpageLayoutProps {
  title: string;
  description: string;
  backHref?: string;
  backLabel?: string;
  children: React.ReactNode;
  narrow?: boolean;
  className?: string;
}

export function InspectorSubpageLayout({
  title,
  description,
  backHref = "/inspector",
  backLabel = "Back to overview",
  children,
  narrow = false,
  className,
}: InspectorSubpageLayoutProps) {
  return (
    <InspectorShell narrow={narrow} className={className}>
      <Link
        href={backHref}
        className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        {backLabel}
      </Link>

      <header className={cn("mb-8 border-b pb-6", narrow && "mb-6")}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary">
          Inspector
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </header>

      {children}
    </InspectorShell>
  );
}
