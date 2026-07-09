"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { AppLogoMark } from "@/components/brand/app-logo";
import { ButtonLink } from "@/components/ui/button-link";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";

const SLIDE_INTERVAL_MS = 5500;

const HOME_HERO_SLIDES = [
  {
    src: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=2000&q=80",
    alt: "Modern apartment community exterior",
  },
  {
    src: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=80",
    alt: "Landscaped garden and community spaces",
  },
  {
    src: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2000&q=80",
    alt: "Apartment towers at dusk",
  },
  {
    src: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=2000&q=80",
    alt: "Gated entrance and security desk",
  },
] as const;

interface HomeHeroBannerProps {
  appName: string;
  city: string;
  tagline: string;
}

export function HomeHeroBanner({ appName, city, tagline }: HomeHeroBannerProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const goToSlide = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  const goNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % HOME_HERO_SLIDES.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const timer = window.setInterval(goNext, SLIDE_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [goNext, isPaused]);

  return (
    <section
      className="relative isolate min-h-[min(100svh,880px)] overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-roledescription="carousel"
      aria-label="Homepage hero gallery"
    >
      {HOME_HERO_SLIDES.map((slide, index) => {
        const isActive = index === activeIndex;
        return (
          <div
            key={slide.src}
            aria-hidden={!isActive}
            className={cn(
              "absolute inset-0 transition-[opacity,transform] duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
              isActive
                ? "z-10 opacity-100"
                : "z-0 opacity-0 scale-[1.03] translate-x-[1.5%]"
            )}
          >
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              priority={index === 0}
              sizes="100vw"
              className={cn(
                "object-cover object-[center_35%]",
                isActive && "landing-hero-ken-burns"
              )}
            />
          </div>
        );
      })}

      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-28 bg-gradient-to-b from-[#142038]/40 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-44 bg-gradient-to-t from-[#142038] via-[#142038]/70 to-transparent sm:h-48" />
      <div className="pointer-events-none absolute bottom-0 left-0 z-20 h-[min(78%,540px)] w-[min(100%,50rem)] bg-gradient-to-tr from-[#142038]/80 via-[#142038]/40 to-transparent" />

      <div className="relative z-30 mx-auto flex min-h-[min(100svh,880px)] max-w-7xl flex-col justify-end px-4 pb-20 pt-28 sm:px-6 sm:pb-24 sm:pt-32 lg:px-8">
        <div className="max-w-2xl">
          <HeroText delay="80ms">
            <div className="flex items-center gap-3">
              <AppLogoMark
                size="lg"
                className="drop-shadow-[0_10px_24px_rgba(0,0,0,0.35)]"
              />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-300">
                  Community operations
                </p>
                <p className="mt-0.5 text-sm text-slate-300">
                  {city} · Demo live
                </p>
              </div>
            </div>
          </HeroText>

          <HeroText delay="200ms">
            <h1 className="mt-8 font-[family-name:var(--font-landing-display)] text-[clamp(2.6rem,6.5vw,4.75rem)] font-semibold leading-[0.96] tracking-[-0.03em] text-balance text-white">
              {appName}
            </h1>
          </HeroText>

          <HeroText delay="320ms">
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-200 sm:text-xl">
              {tagline}
            </p>
          </HeroText>

          <HeroText delay="440ms">
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <ButtonLink
                size="lg"
                href={routes.public.login}
                className="h-12 rounded-full px-6 text-base font-semibold shadow-[0_12px_32px_rgba(37,99,235,0.35)]"
              >
                Enter portals
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </ButtonLink>
              <ButtonLink
                size="lg"
                href={routes.public.about}
                variant="outline"
                className="h-12 rounded-full border-white/25 bg-white/10 px-6 text-base text-white backdrop-blur hover:bg-white/15 hover:text-white"
              >
                About the demo
              </ButtonLink>
            </div>
          </HeroText>

          <HeroText delay="560ms">
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <div
                className="flex items-center gap-2"
                role="tablist"
                aria-label="Hero slides"
              >
                {HOME_HERO_SLIDES.map((slide, index) => (
                  <button
                    key={slide.src}
                    type="button"
                    role="tab"
                    aria-selected={index === activeIndex}
                    aria-label={`Show slide ${index + 1} of ${HOME_HERO_SLIDES.length}`}
                    onClick={() => goToSlide(index)}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
                      index === activeIndex
                        ? "w-8 bg-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.5)]"
                        : "w-1.5 bg-white/40 hover:bg-white/60"
                    )}
                  />
                ))}
              </div>
              <span className="text-[11px] font-semibold tabular-nums tracking-[0.14em] text-slate-400">
                {String(activeIndex + 1).padStart(2, "0")} /{" "}
                {String(HOME_HERO_SLIDES.length).padStart(2, "0")}
              </span>
            </div>
          </HeroText>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-30 h-0.5 bg-[#142038]">
        <div
          key={`${activeIndex}-${isPaused ? "paused" : "play"}`}
          className={cn(
            "h-full origin-left bg-sky-400/80",
            !isPaused && "landing-hero-progress"
          )}
          style={isPaused ? { transform: "scaleX(0)" } : undefined}
        />
      </div>
    </section>
  );
}

function HeroText({
  children,
  delay,
}: {
  children: ReactNode;
  delay: string;
}) {
  return (
    <div className="landing-hero-text-in" style={{ animationDelay: delay }}>
      {children}
    </div>
  );
}
