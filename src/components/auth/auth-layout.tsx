import Link from "next/link";
import { Building2 } from "lucide-react";
import { appConfig } from "@/config/app";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  className?: string;
}

export function AuthLayout({ children, title, subtitle, className }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4 py-10">
      <div className={cn("w-full max-w-[420px]", className)}>
        <div className="mb-8 text-center">
          <Link
            href={routes.public.home}
            className="mx-auto inline-flex flex-col items-center gap-3 transition-opacity hover:opacity-90"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary shadow-sm">
              <Building2 className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <p className="text-lg font-semibold tracking-tight">{appConfig.name}</p>
              <p className="text-xs text-muted-foreground">{appConfig.tagline}</p>
            </div>
          </Link>
        </div>

        <div className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
          <div className="mb-6 text-center">
            <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
            {subtitle && (
              <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
