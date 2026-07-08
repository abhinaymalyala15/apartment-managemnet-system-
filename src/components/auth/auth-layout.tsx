"use client";

import Link from "next/link";
import { AppLogo } from "@/components/brand/app-logo";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";

interface AuthShellProps {
  children: React.ReactNode;
  /** Narrow card for forms; wider for portal chooser */
  width?: "form" | "chooser";
  className?: string;
  showHomeLink?: boolean;
}

/**
 * Shared courtyard-dusk shell for every login / auth screen.
 * Light mist canvas + soft white card. Simple, focused, on-theme.
 */
export function AuthShell({
  children,
  width = "form",
  className,
  showHomeLink = true,
}: AuthShellProps) {
  return (
    <div className="relative flex min-h-svh flex-col overflow-hidden bg-[#f3f6fb]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_12%_0%,rgba(56,189,248,0.14),transparent_42%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_90%_100%,rgba(20,32,56,0.08),transparent_40%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#142038] via-sky-400/70 to-[#142038]" />

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-10 sm:py-14">
        <div
          className={cn(
            "w-full",
            width === "form" ? "max-w-[420px]" : "max-w-lg",
            className
          )}
        >
          <div className="mb-7 text-center">
            <AppLogo
              href={routes.public.home}
              size="md"
              className="mx-auto justify-center"
              textClassName="font-[family-name:var(--font-landing-sans)] text-slate-900"
              subtitle=""
            />
            <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Portal access
            </p>
          </div>

          <div className="overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white shadow-[0_16px_50px_rgba(15,23,42,0.07)]">
            <div className="h-1 bg-gradient-to-r from-[#142038] via-sky-500 to-sky-300" />
            <div className="p-6 sm:p-8">{children}</div>
          </div>

          {showHomeLink && (
            <p className="mt-6 text-center text-sm text-slate-500">
              <Link
                href={routes.public.home}
                className="font-medium text-primary transition-colors hover:text-primary/80"
              >
                ← Back to home
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  className?: string;
  showHomeLink?: boolean;
}

export function AuthLayout({
  children,
  title,
  subtitle,
  className,
  showHomeLink = true,
}: AuthLayoutProps) {
  return (
    <AuthShell width="form" className={className} showHomeLink={showHomeLink}>
      <div className="mb-6 text-center">
        <h1 className="font-[family-name:var(--font-landing-display)] text-2xl font-semibold tracking-tight text-slate-900">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{subtitle}</p>
        )}
      </div>
      {children}
    </AuthShell>
  );
}
