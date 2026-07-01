import Link from "next/link";
import { Building2 } from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import { appConfig } from "@/config/app";
import { routes } from "@/config/routes";

const publicNav = [
  { href: routes.public.home, label: "Home" },
  { href: routes.public.about, label: "About" },
  { href: routes.public.features, label: "Features" },
  { href: routes.public.gallery, label: "Gallery" },
  { href: routes.public.contact, label: "Contact" },
];

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Building2 className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold leading-none">{appConfig.name}</span>
            <span className="text-[10px] text-muted-foreground">{appConfig.tagline}</span>
          </div>
        </Link>

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

        <div className="flex items-center gap-2">
          <ButtonLink variant="ghost" size="sm" className="md:hidden" href="/contact">
            Contact
          </ButtonLink>
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
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Building2 className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">ApartmentERP</span>
            </div>
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
