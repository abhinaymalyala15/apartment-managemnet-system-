import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  LandingPageHero,
  LandingSectionHeader,
} from "@/components/layout/landing-page-hero";
import { GalleryWorkspace } from "@/components/public/gallery-workspace";
import { ButtonLink } from "@/components/ui/button-link";
import { routes } from "@/config/routes";
import { getApartment, getGallery } from "@/lib/data";

export default function GalleryPage() {
  const apartment = getApartment();
  const images = getGallery();

  return (
    <div className="landing bg-[#f3f6fb] text-slate-900">
      <LandingPageHero
        eyebrow="Community gallery"
        title="Life at Sylvan Shelter"
        description="Building elevations, shared spaces, parking, gardens, and festival moments — a visual walkthrough of our neighbourhood."
        image="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=80"
        imageAlt="Community spaces at Sylvan Shelter Apartment"
      />

      <section className="relative bg-[#142038] py-10 text-white">
        <div className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <LandingSectionHeader
              eyebrow="Browse"
              title={`${images.length} photos across the society`}
              description={`Filter by category to explore amenities, events, and everyday spaces at ${apartment.name}.`}
              dark
            />
            <ButtonLink
              href={routes.public.about}
              variant="outline"
              className="rounded-full border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
            >
              About us
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </ButtonLink>
          </div>
        </div>
      </section>

      <section className="bg-[#f3f6fb] py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <GalleryWorkspace images={images} />
        </div>
      </section>

      <section className="bg-[#f3f6fb] pb-16 sm:pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)] sm:grid sm:grid-cols-[1.2fr_0.9fr]">
            <div className="px-6 py-8 sm:px-10 sm:py-10">
              <h2 className="font-[family-name:var(--font-landing-display)] text-3xl font-semibold tracking-[-0.02em] text-balance text-slate-900">
                Questions about the society?
              </h2>
              <p className="mt-3 max-w-md text-base text-slate-600">
                Reach the management office for maintenance requests, visitor
                passes, or committee enquiries.
              </p>
              <ButtonLink
                size="lg"
                href={routes.public.contact}
                className="mt-7 h-12 rounded-full px-6 text-base font-semibold"
              >
                Contact office
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </ButtonLink>
            </div>
            <div className="relative flex flex-col justify-end bg-[#142038] px-6 py-8 text-white sm:px-10 sm:py-10">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(56,189,248,0.18),transparent_50%)]" />
              <p className="relative text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-300/90">
                Demo note
              </p>
              <p className="relative mt-3 text-lg font-medium leading-snug tracking-tight">
                Gallery images are representative placeholders for the demo walkthrough.
              </p>
              <Link
                href={routes.public.home}
                className="relative mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-sky-300 hover:text-sky-200"
              >
                Back to home
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
