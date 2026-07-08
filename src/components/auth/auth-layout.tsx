"use client";

import { AppLogo } from "@/components/brand/app-logo";
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
          <AppLogo
            href={routes.public.home}
            size="lg"
            className="mx-auto flex-col items-center gap-3 text-center"
          />
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
