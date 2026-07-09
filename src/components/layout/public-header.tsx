"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowRight, Menu } from "lucide-react";
import { AppLogo } from "@/components/brand/app-logo";
import { ButtonLink } from "@/components/ui/button-link";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";

const publicNav = [
  { href: routes.public.home, label: "Home" },
  { href: routes.public.about, label: "About" },
  { href: routes.public.gallery, label: "Gallery" },
  { href: routes.public.contact, label: "Contact" },
];

const LANDING_THEME_ROUTES = new Set<string>([
  routes.public.home,
  routes.public.about,
  routes.public.gallery,
  routes.public.contact,
]);

export function PublicHeader() {
  const pathname = usePathname();
  const isHome = pathname === routes.public.home;
  const isLandingTheme = LANDING_THEME_ROUTES.has(pathname);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!isHome) {
      setScrolled(false);
      return;
    }
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  const useLandingHeader = isLandingTheme;

  return (
    <header
      className={cn(
        "z-50 transition-[background-color,border-color,box-shadow,backdrop-filter] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
        isHome
          ? cn(
              "fixed inset-x-0 top-0",
              scrolled
                ? "border-b border-slate-200/80 bg-white/90 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl"
                : "border-b border-transparent bg-gradient-to-b from-white/80 via-white/40 to-transparent"
            )
          : useLandingHeader
            ? "sticky top-0 border-b border-slate-200/80 bg-white/90 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl"
            : "sticky top-0 border-b border-border bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80"
      )}
    >
      <div
        className={cn(
          "mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8",
          useLandingHeader ? "h-[4.25rem]" : "h-16"
        )}
      >
        <AppLogo
          href="/"
          size="sm"
          className="min-w-0"
          textClassName={cn(
            useLandingHeader &&
              "font-[family-name:var(--font-landing-sans)] text-[0.95rem] font-semibold tracking-tight text-slate-900"
          )}
          subtitle=""
        />

        <nav
          className={cn(
            "hidden items-center md:flex",
            useLandingHeader
              ? "rounded-full border border-slate-200/80 bg-white/70 p-1 shadow-[0_4px_20px_rgba(15,23,42,0.04)] backdrop-blur-md"
              : "gap-1"
          )}
          aria-label="Primary"
        >
          {publicNav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200",
                  useLandingHeader
                    ? active
                      ? "bg-primary/10 text-primary"
                      : "text-slate-500 hover:bg-slate-100/80 hover:text-slate-900"
                    : active
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <Sheet>
            <SheetTrigger
              className={cn(
                "inline-flex size-10 items-center justify-center rounded-full border md:hidden",
                useLandingHeader
                  ? "border-slate-200 bg-white/80 text-slate-700 hover:bg-white"
                  : "border-border bg-background hover:bg-muted"
              )}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-[min(100vw,20rem)]">
              <SheetTitle className="text-base font-semibold">Menu</SheetTitle>
              <nav className="mt-6 flex flex-col gap-1.5">
                {publicNav.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "rounded-xl px-3.5 py-3 text-sm font-medium transition-colors",
                        active
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
              <div className="mt-6 border-t pt-6">
                <ButtonLink
                  className="w-full rounded-full"
                  href={routes.public.login}
                >
                  Login
                  <ArrowRight className="h-4 w-4" />
                </ButtonLink>
              </div>
            </SheetContent>
          </Sheet>

          <ButtonLink
            size="sm"
            href={routes.public.login}
            className={cn(
              "hidden sm:inline-flex",
              useLandingHeader &&
                "h-9 rounded-full px-4 font-semibold shadow-[0_8px_24px_rgba(37,99,235,0.16)]"
            )}
          >
            Login
            {useLandingHeader && <ArrowRight className="h-3.5 w-3.5" />}
          </ButtonLink>
        </div>
      </div>
    </header>
  );
}

export function PublicFooter() {
  const pathname = usePathname();
  const isLandingTheme = LANDING_THEME_ROUTES.has(pathname);

  return (
    <footer
      className={cn(
        "border-t",
        isLandingTheme
          ? "border-[#1a2a45] bg-[#101b30] text-white"
          : "border-border bg-muted/30"
      )}
    >
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3">
          <div className="sm:col-span-2 md:col-span-1">
            <AppLogo
              size="sm"
              textClassName={
                isLandingTheme
                  ? "font-[family-name:var(--font-landing-sans)] text-white"
                  : undefined
              }
              subtitle=""
            />
            <p
              className={cn(
                "mt-3 text-sm leading-relaxed",
                isLandingTheme ? "text-slate-400" : "text-slate-500"
              )}
            >
              A complete ERP platform for apartment communities. Digitizing
              society management across India.
            </p>
          </div>
          <div>
            <h4
              className={cn(
                "text-[11px] font-semibold uppercase tracking-[0.16em]",
                isLandingTheme ? "text-sky-300/90" : "text-primary"
              )}
            >
              Quick Links
            </h4>
            <ul className="mt-3 space-y-2">
              {publicNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "text-sm transition-colors",
                      isLandingTheme
                        ? "text-slate-400 hover:text-sky-300"
                        : "text-slate-500 hover:text-primary"
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4
              className={cn(
                "text-[11px] font-semibold uppercase tracking-[0.16em]",
                isLandingTheme ? "text-sky-300/90" : "text-primary"
              )}
            >
              Demo
            </h4>
            <p
              className={cn(
                "mt-3 text-sm leading-relaxed",
                isLandingTheme ? "text-slate-400" : "text-slate-500"
              )}
            >
              This is a frontend prototype powered by demo data. No backend or
              authentication is connected.
            </p>
          </div>
        </div>
        <div
          className={cn(
            "mt-8 border-t pt-8 text-center text-sm",
            isLandingTheme
              ? "border-white/10 text-slate-500"
              : "border-slate-200/80 text-slate-400"
          )}
        >
          © {new Date().getFullYear()} ApartmentERP. Demo prototype.
        </div>
      </div>
    </footer>
  );
}
