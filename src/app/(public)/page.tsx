import Link from "next/link";
import {
  Building2,
  ArrowRight,
  User,
  ClipboardList,
  Shield,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button-link";
import { appConfig } from "@/config/app";
import { routes } from "@/config/routes";
import { getApartment } from "@/lib/data";

export default function HomePage() {
  const apartment = getApartment();

  const rolePortals = [
    {
      label: "Resident",
      description: "Bills, notices, flat details, and family",
      meta: "Demo: Srinivas Malyala · Flat 110",
      href: routes.dashboard.resident.root,
      icon: User,
      accent: "bg-blue-500/10 text-blue-700",
    },
    {
      label: "Inspector",
      description: "Browse flats, find people, and review unpaid bills",
      meta: "Read-only society overview",
      href: routes.dashboard.inspector.root,
      icon: ClipboardList,
      accent: "bg-violet-500/10 text-violet-700",
    },
    {
      label: "Admin",
      description: "Society management and configuration",
      meta: "Coming soon in demo",
      href: routes.dashboard.admin.root,
      icon: Shield,
      accent: "bg-slate-500/10 text-slate-700",
    },
  ];

  return (
    <div>
      <section className="relative overflow-hidden border-b bg-gradient-to-b from-primary/[0.06] via-background to-background">
        <div className="pointer-events-none absolute -right-24 top-0 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 bottom-0 h-48 w-48 rounded-full bg-primary/5 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-md shadow-primary/20">
              <Building2 className="h-7 w-7 text-primary-foreground" />
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <Badge variant="secondary" className="font-normal">
                Demo prototype
              </Badge>
              <Badge variant="outline" className="font-normal">
                {apartment.name}
              </Badge>
            </div>

            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
              {appConfig.name}
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              {appConfig.description}
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              Pick a portal below to explore how residents, inspectors, and
              admins use the platform.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <ButtonLink size="lg" href={routes.public.login}>
                Portal access
                <ArrowRight className="ml-2 h-4 w-4" />
              </ButtonLink>
              <ButtonLink size="lg" variant="outline" href={routes.public.about}>
                Learn more
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-muted/30 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-semibold tracking-tight">
              Try the demo portals
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Three roles for {apartment.name}. Each opens a separate dashboard
              with sample data.
            </p>
          </div>

          <div className="mx-auto mt-10 grid max-w-5xl gap-4 sm:grid-cols-3">
            {rolePortals.map((portal) => (
              <Link
                key={portal.href}
                href={portal.href}
                className="group flex flex-col rounded-2xl border bg-card p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
              >
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${portal.accent}`}
                >
                  <portal.icon className="h-5 w-5" />
                </div>
                <p className="mt-4 text-lg font-semibold">{portal.label}</p>
                <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {portal.description}
                </p>
                <p className="mt-3 text-xs text-muted-foreground">{portal.meta}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                  Open dashboard
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
