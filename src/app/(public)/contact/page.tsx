import Link from "next/link";
import { ArrowRight, Clock, Mail, MapPin, Phone, ShieldAlert } from "lucide-react";
import { ContactForm } from "@/components/contact-form";
import {
  LandingPageHero,
  LandingSectionHeader,
} from "@/components/layout/landing-page-hero";
import { ButtonLink } from "@/components/ui/button-link";
import { routes } from "@/config/routes";
import { getApartment, getCommitteeContacts } from "@/lib/data";

export default function ContactPage() {
  const apartment = getApartment();
  const contacts = getCommitteeContacts();

  return (
    <div className="landing bg-[#f3f6fb] text-slate-900">
      <LandingPageHero
        eyebrow="Get in touch"
        title="Contact the society office"
        description="Maintenance requests, visitor passes, committee enquiries — our management team is here during office hours."
        image="https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=2000&q=80"
        imageAlt="Society office entrance"
        compact
      />

      <section className="bg-[#f3f6fb] py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)] lg:grid lg:grid-cols-[0.95fr_1.05fr]">
            <div className="relative bg-[#142038] px-6 py-8 text-white sm:px-8 sm:py-10">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_0%_0%,rgba(56,189,248,0.14),transparent_50%)]" />
              <div className="relative">
                <LandingSectionHeader
                  eyebrow="Office details"
                  title="Society management"
                  description="Visit in person or call during working hours. For emergencies, use the contacts below."
                  dark
                />

                <ul className="mt-8 space-y-5">
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
                    <Clock className="mt-0.5 h-5 w-5 shrink-0 text-sky-300" />
                    <div>
                      <p className="font-medium">Office hours</p>
                      <p className="mt-1 text-sm text-slate-300">
                        Mon – Sat: 9:00 AM – 6:00 PM
                        <br />
                        Sunday: 10:00 AM – 1:00 PM
                      </p>
                    </div>
                  </li>
                </ul>

                <div className="mt-8 rounded-2xl border border-amber-400/25 bg-amber-500/10 p-5">
                  <div className="flex items-center gap-2 text-amber-100">
                    <ShieldAlert className="h-4 w-4" />
                    <h3 className="text-sm font-semibold">Emergency contacts</h3>
                  </div>
                  <ul className="mt-3 space-y-2.5">
                    {contacts.emergency.map((item) => (
                      <li key={item.id} className="text-sm">
                        <p className="font-medium text-amber-50">{item.label}</p>
                        <a
                          href={`tel:${item.phone.replace(/\s/g, "")}`}
                          className="text-amber-200/90 hover:text-amber-100"
                        >
                          {item.phone}
                        </a>
                        <p className="text-xs text-amber-200/70">{item.role}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="px-6 py-8 sm:px-8 sm:py-10">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                Write to us
              </p>
              <h2 className="mt-3 font-[family-name:var(--font-landing-display)] text-2xl font-semibold tracking-[-0.02em] text-slate-900 sm:text-3xl">
                Send a message
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Demo form — submissions are not processed in this prototype.
              </p>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#142038] py-14 text-white sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <LandingSectionHeader
            eyebrow="Committee"
            title="Key contacts"
            description="Reach committee members for society matters beyond day-to-day office requests."
            dark
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {contacts.committee.map((member, index) => (
              <div
                key={member.id}
                className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-sm landing-anim-rise"
                style={{ animationDelay: `${80 + index * 60}ms` }}
              >
                <p className="font-semibold">{member.name}</p>
                <p className="mt-1 text-sm text-sky-300">{member.role}</p>
                <div className="mt-4 space-y-1.5 text-sm text-slate-300">
                  <a
                    href={`tel:${member.phone.replace(/\s/g, "")}`}
                    className="block hover:text-sky-200"
                  >
                    {member.phone}
                  </a>
                  {"email" in member && member.email && (
                    <a
                      href={`mailto:${member.email}`}
                      className="block hover:text-sky-200"
                    >
                      {member.email}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f3f6fb] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)] sm:grid sm:grid-cols-[1.2fr_0.9fr]">
            <div className="px-6 py-8 sm:px-10 sm:py-10">
              <h2 className="font-[family-name:var(--font-landing-display)] text-3xl font-semibold tracking-[-0.02em] text-balance text-slate-900">
                Prefer to explore first?
              </h2>
              <p className="mt-3 max-w-md text-base text-slate-600">
                See photos of the community, read about the society, or jump
                straight into the resident and admin demo portals.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <ButtonLink
                  size="lg"
                  href={routes.public.gallery}
                  variant="outline"
                  className="h-12 rounded-full border-slate-200 bg-white px-6"
                >
                  Gallery
                </ButtonLink>
                <ButtonLink
                  size="lg"
                  href={routes.public.login}
                  className="h-12 rounded-full px-6 font-semibold"
                >
                  Portal access
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </ButtonLink>
              </div>
            </div>
            <div className="relative flex flex-col justify-end bg-[#142038] px-6 py-8 text-white sm:px-10 sm:py-10">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(56,189,248,0.18),transparent_50%)]" />
              <Link
                href={routes.public.about}
                className="relative inline-flex items-center gap-1.5 text-lg font-medium hover:text-sky-300"
              >
                About {apartment.name}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
