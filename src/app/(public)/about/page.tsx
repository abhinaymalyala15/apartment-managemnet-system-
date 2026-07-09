import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Calendar,
  MapPin,
  Mail,
  Phone,
  Shield,
  Sparkles,
  Users,
} from "lucide-react";
import {
  LandingPageHero,
  LandingSectionHeader,
} from "@/components/layout/landing-page-hero";
import { ButtonLink } from "@/components/ui/button-link";
import { routes } from "@/config/routes";
import { getApartment } from "@/lib/data";

const COMMUNITY_IMAGE =
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80";

const AMENITIES = [
  "Clubhouse & Banquet Hall",
  "Swimming Pool",
  "Gymnasium",
  "Children's Play Area",
  "Landscaped Gardens",
  "24/7 Security",
  "Covered Parking",
  "Power Backup (DG)",
  "Rainwater Harvesting",
];

export default function AboutPage() {
  const apartment = getApartment();

  const highlights = [
    {
      icon: Building2,
      label: "Blocks",
      value: `${apartment.totalBlocks}`,
      tone: "text-sky-300",
    },
    {
      icon: Users,
      label: "Flats",
      value: `${apartment.totalFlats}`,
      tone: "text-teal-300",
    },
    {
      icon: Calendar,
      label: "Since",
      value: `${apartment.yearEstablished}`,
      tone: "text-amber-200",
    },
    {
      icon: MapPin,
      label: "City",
      value: apartment.city,
      tone: "text-sky-300",
    },
  ];

  return (
    <div className="landing bg-[#f3f6fb] text-slate-900">
      <LandingPageHero
        eyebrow="Our community"
        title={apartment.name}
        description={`${apartment.tagline}. A calm residential society in ${apartment.city} — managed with care, transparency, and a strong sense of neighbourhood.`}
        image="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=2000&q=80"
        imageAlt={`${apartment.name} exterior`}
      />

      <section className="relative bg-[#142038] py-14 text-white sm:py-16">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(56,189,248,0.12),transparent_45%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {highlights.map((item, index) => (
              <div
                key={item.label}
                className="rounded-3xl border border-white/10 bg-white/[0.06] p-6 backdrop-blur-sm landing-anim-rise"
                style={{ animationDelay: `${100 + index * 70}ms` }}
              >
                <item.icon className={`h-5 w-5 ${item.tone}`} />
                <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                  {item.label}
                </p>
                <p className="mt-1 font-[family-name:var(--font-landing-display)] text-3xl font-semibold tracking-tight">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="overflow-hidden bg-[#f3f6fb]">
        <div className="grid lg:grid-cols-2">
          <div className="relative min-h-[320px] lg:min-h-[480px]">
            <Image
              src={COMMUNITY_IMAGE}
              alt="Community garden and shared spaces"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#142038]/40 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-[#f3f6fb]/30" />
          </div>
          <div className="flex flex-col justify-center px-6 py-14 sm:px-10 lg:px-14">
            <LandingSectionHeader
              eyebrow="Who we are"
              title="A society built for everyday living"
              description={apartment.description}
            />
            <p className="mt-5 max-w-lg text-base leading-relaxed text-slate-600">
              Registered under {apartment.registrationNumber}, our Residents Welfare
              Association manages maintenance, security, and community events with
              resident volunteers who care about the neighbourhood.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink
                href={routes.public.gallery}
                variant="outline"
                className="rounded-full border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              >
                View gallery
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </ButtonLink>
              <ButtonLink
                href={routes.public.contact}
                className="rounded-full"
              >
                Contact office
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f3f6fb] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <LandingSectionHeader
            eyebrow="Amenities"
            title="Spaces that bring neighbours together"
            description="From quiet gardens to celebration halls — everything residents need, maintained with care."
          />

          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {AMENITIES.map((amenity, index) => (
              <div
                key={amenity}
                className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white px-4 py-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)] landing-anim-rise"
                style={{ animationDelay: `${60 + index * 40}ms` }}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Sparkles className="h-4 w-4" />
                </span>
                <span className="text-sm font-medium text-slate-700">{amenity}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#142038] py-16 text-white sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <LandingSectionHeader
              eyebrow="Reach us"
              title="Society office & registration"
              description="Visit the management office during working hours, or write to us for maintenance requests and general enquiries."
              dark
            />
            <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-6 backdrop-blur-sm sm:p-8">
              <ul className="space-y-5">
                <li className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-sky-300" />
                  <div>
                    <p className="font-medium">Address</p>
                    <p className="mt-1 text-sm leading-relaxed text-slate-300">
                      {apartment.address}
                      <br />
                      {apartment.city}, {apartment.state} — {apartment.pincode}
                    </p>
                  </div>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="h-5 w-5 shrink-0 text-sky-300" />
                  <div>
                    <p className="font-medium">Phone</p>
                    <a
                      href={`tel:${apartment.phone.replace(/\s/g, "")}`}
                      className="text-sm text-slate-300 hover:text-sky-300"
                    >
                      {apartment.phone}
                    </a>
                  </div>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="h-5 w-5 shrink-0 text-sky-300" />
                  <div>
                    <p className="font-medium">Email</p>
                    <a
                      href={`mailto:${apartment.email}`}
                      className="text-sm text-slate-300 hover:text-sky-300"
                    >
                      {apartment.email}
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Shield className="mt-0.5 h-5 w-5 shrink-0 text-sky-300" />
                  <div>
                    <p className="font-medium">Registration</p>
                    <p className="text-sm text-slate-300">
                      {apartment.registrationNumber}
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f3f6fb] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)] sm:grid sm:grid-cols-[1.2fr_0.9fr]">
            <div className="px-6 py-8 sm:px-10 sm:py-10">
              <h2 className="font-[family-name:var(--font-landing-display)] text-3xl font-semibold tracking-[-0.02em] text-balance text-slate-900">
                Explore the demo society
              </h2>
              <p className="mt-3 max-w-md text-base text-slate-600">
                Walk through resident bills, inspector operations, and admin setup
                — all powered by sample data for {apartment.name}.
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
              <p className="relative text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-300/90">
                Also see
              </p>
              <Link
                href={routes.public.gallery}
                className="relative mt-3 inline-flex items-center gap-1.5 text-lg font-medium text-white hover:text-sky-300"
              >
                Community gallery
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
