import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ClipboardList,
  Shield,
  User,
} from "lucide-react";
import { AppLogoMark } from "@/components/brand/app-logo";
import { ButtonLink } from "@/components/ui/button-link";
import { appConfig } from "@/config/app";
import { routes } from "@/config/routes";
import { getApartment } from "@/lib/data";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=2000&q=80";

export default function HomePage() {
  const apartment = getApartment();

  const portals = [
    {
      label: "Resident",
      description:
        "Bills, notices, balance sheet, flat and family — all in one calm home screen.",
      meta: "Demo · Srinivas Malyala · Flat 110",
      href: routes.auth.resident.entry,
      icon: User,
      tone: "resident" as const,
    },
    {
      label: "Inspector",
      description:
        "Outstanding dues, complaints, visitors, notices, and day-to-day society ops.",
      meta: "Apartment office operations",
      href: routes.dashboard.inspector.root,
      icon: ClipboardList,
      tone: "inspector" as const,
    },
    {
      label: "Admin",
      description:
        "Blocks, flats, billing setup, users, and monthly balance sheet publishing.",
      meta: "Society configuration",
      href: routes.dashboard.admin.root,
      icon: Shield,
      tone: "admin" as const,
    },
  ];

  const toneClass = {
    resident: "bg-sky-500/15 text-sky-200 ring-sky-400/25",
    inspector: "bg-teal-500/15 text-teal-200 ring-teal-400/25",
    admin: "bg-amber-500/15 text-amber-100 ring-amber-400/20",
  };

  return (
    <div className="landing bg-[#f3f6fb] text-slate-900">
      {/* Light hero — soft courtyard light */}
      <section className="relative isolate min-h-[min(100svh,880px)] overflow-hidden">
        <Image
          src={HERO_IMAGE}
          alt="Modern apartment community exterior"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_35%] landing-anim-zoom"
        />
        <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(243,246,251,0.94)_0%,rgba(243,246,251,0.78)_40%,rgba(15,23,42,0.35)_78%,rgba(15,23,42,0.55)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_18%_30%,rgba(255,255,255,0.55),transparent_48%)]" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#142038] to-transparent" />

        <div className="relative mx-auto flex min-h-[min(100svh,880px)] max-w-7xl flex-col justify-end px-4 pb-20 pt-28 sm:px-6 sm:pb-24 sm:pt-32 lg:px-8">
          <div className="max-w-2xl landing-anim-rise">
            <div className="flex items-center gap-3">
              <AppLogoMark
                size="lg"
                className="drop-shadow-[0_10px_24px_rgba(15,23,42,0.18)]"
              />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
                  Community operations
                </p>
                <p className="mt-0.5 text-sm text-slate-600">
                  {apartment.city} · Demo live
                </p>
              </div>
            </div>

            <h1 className="mt-8 font-[family-name:var(--font-landing-display)] text-[clamp(2.6rem,6.5vw,4.75rem)] font-semibold leading-[0.96] tracking-[-0.03em] text-balance text-slate-900">
              {appConfig.name}
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-700 sm:text-xl">
              Light enough for everyday living. Deep enough for the work that
              runs a society — residents, inspectors, and admins together.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <ButtonLink
                size="lg"
                href={routes.public.login}
                className="h-12 rounded-full px-6 text-base font-semibold shadow-[0_12px_32px_rgba(37,99,235,0.22)]"
              >
                Enter portals
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </ButtonLink>
              <ButtonLink
                size="lg"
                href={routes.public.about}
                variant="outline"
                className="h-12 rounded-full border-white/70 bg-white/70 px-6 text-base text-slate-800 backdrop-blur hover:bg-white"
              >
                About the demo
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      {/* Deep portal band — little dark, elevated light cards */}
      <section
        id="portals"
        className="relative bg-[#142038] py-16 text-white sm:py-20"
      >
        <div className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_70%_0%,rgba(56,189,248,0.12),transparent_45%)]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-300/90">
              Demo portals
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-landing-display)] text-3xl font-semibold tracking-[-0.02em] text-balance sm:text-4xl">
              Three roles. One society.
            </h2>
            <p className="mt-3 text-base leading-relaxed text-slate-300">
              Explore {apartment.name} with sample data — pick the seat that
              matches how you work.
            </p>
          </div>

          <div className="mt-12 grid gap-4 lg:grid-cols-3">
            {portals.map((portal, index) => (
              <Link
                key={portal.href}
                href={portal.href}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.25)] backdrop-blur-sm transition-[transform,background-color,border-color] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:border-sky-300/30 hover:bg-white/[0.1] landing-anim-rise"
                style={{ animationDelay: `${120 + index * 90}ms` }}
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl ring-1 ${toneClass[portal.tone]}`}
                >
                  <portal.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-6 text-xl font-semibold tracking-tight">
                  {portal.label}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-300">
                  {portal.description}
                </p>
                <p className="mt-4 text-xs text-slate-400">{portal.meta}</p>
                <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-sky-300">
                  Open dashboard
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 ease-out group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Light community strip */}
      <section className="overflow-hidden bg-[#f3f6fb]">
        <div className="grid lg:grid-cols-2">
          <div className="relative min-h-[300px] lg:min-h-[420px]">
            <Image
              src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80"
              alt="Apartment towers against evening sky"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#142038]/50 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-[#f3f6fb]/40" />
          </div>
          <div className="flex flex-col justify-center px-6 py-14 sm:px-10 lg:px-14">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
              Demo community
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-landing-display)] text-3xl font-semibold tracking-[-0.02em] text-balance text-slate-900 sm:text-[2.25rem]">
              {apartment.name}
            </h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-slate-600">
              {apartment.address}, {apartment.city} — {apartment.totalFlats} flats,
              one block, and a live walkthrough of how modern society management
              feels day to day.
            </p>
            <div className="mt-8">
              <ButtonLink
                href={routes.public.gallery}
                variant="outline"
                className="rounded-full border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              >
                View gallery
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      {/* Closing CTA — light shell with deep accent panel */}
      <section className="bg-[#f3f6fb] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)] sm:grid sm:grid-cols-[1.2fr_0.9fr]">
            <div className="px-6 py-8 sm:px-10 sm:py-10">
              <h2 className="font-[family-name:var(--font-landing-display)] text-3xl font-semibold tracking-[-0.02em] text-balance text-slate-900">
                Ready to walk the portals?
              </h2>
              <p className="mt-3 max-w-md text-base text-slate-600">
                No signup required for Inspector and Admin. Resident login uses
                the demo account from the portal access page.
              </p>
              <ButtonLink
                size="lg"
                href={routes.public.login}
                className="mt-7 h-12 rounded-full px-6 text-base font-semibold"
              >
                Portal access
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </ButtonLink>
            </div>
            <div className="relative flex flex-col justify-end bg-[#142038] px-6 py-8 text-white sm:px-10 sm:py-10">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(56,189,248,0.18),transparent_50%)]" />
              <div className="relative">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-300/90">
                  Why this blend
                </p>
                <p className="mt-3 text-lg font-medium leading-snug tracking-tight">
                  Daylight for everyday living.
                  <br />
                  Depth for the ops that keep the society running.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
