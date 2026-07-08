"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
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

export function PublicHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <AppLogo href="/" size="sm" className="min-w-0" />

        <nav className="hidden items-center gap-1 md:flex">
          {publicNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <Sheet>
            <SheetTrigger
              className="inline-flex size-10 items-center justify-center rounded-lg border border-border bg-background hover:bg-muted md:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-[min(100vw,20rem)]">
              <SheetTitle className="text-base font-semibold">Menu</SheetTitle>
              <nav className="mt-6 flex flex-col gap-1">
                {publicNav.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "rounded-lg px-3 py-3 text-sm font-medium transition-colors",
                        active
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
              <div className="mt-6 border-t pt-6">
                <ButtonLink className="w-full" href={routes.public.login}>
                  Login
                </ButtonLink>
              </div>
            </SheetContent>
          </Sheet>
          <ButtonLink size="sm" href={routes.public.login}>
            Login
          </ButtonLink>
        </div>
      </div>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3">
          <div className="sm:col-span-2 md:col-span-1">
            <AppLogo size="sm" />
            <p className="mt-3 text-sm text-muted-foreground">
              A complete ERP platform for apartment communities. Digitizing
              society management across India.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Quick Links</h4>
            <ul className="mt-3 space-y-2">
              {publicNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Demo</h4>
            <p className="mt-3 text-sm text-muted-foreground">
              This is a frontend prototype powered by demo data. No backend or
              authentication is connected.
            </p>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} ApartmentERP. Demo prototype.
        </div>
      </div>
    </footer>
  );
}
