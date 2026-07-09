import Image from "next/image";
import { cn } from "@/lib/utils";

interface LandingPageHeroProps {
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  className?: string;
  compact?: boolean;
}

export function LandingPageHero({
  eyebrow,
  title,
  description,
  image,
  imageAlt,
  className,
  compact = false,
}: LandingPageHeroProps) {
  return (
    <section
      className={cn(
        "relative isolate overflow-hidden",
        compact ? "min-h-[280px] sm:min-h-[320px]" : "min-h-[360px] sm:min-h-[420px]",
        className
      )}
    >
      <Image
        src={image}
        alt={imageAlt}
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(243,246,251,0.96)_0%,rgba(243,246,251,0.82)_42%,rgba(20,32,56,0.45)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_12%_40%,rgba(255,255,255,0.5),transparent_50%)]" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#142038] to-transparent" />

      <div className="relative mx-auto flex max-w-7xl flex-col justify-end px-4 pb-12 pt-24 sm:px-6 sm:pb-14 sm:pt-28 lg:px-8">
        <div className="max-w-2xl landing-anim-rise">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
            {eyebrow}
          </p>
          <h1 className="mt-4 font-[family-name:var(--font-landing-display)] text-[clamp(2.25rem,5vw,3.75rem)] font-semibold leading-[1.02] tracking-[-0.03em] text-balance text-slate-900">
            {title}
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-700 sm:text-lg">
            {description}
          </p>
        </div>
      </div>
    </section>
  );
}

interface LandingSectionHeaderProps {
  eyebrow: string;
  title: string;
  description?: string;
  dark?: boolean;
  className?: string;
}

export function LandingSectionHeader({
  eyebrow,
  title,
  description,
  dark = false,
  className,
}: LandingSectionHeaderProps) {
  return (
    <div className={cn("max-w-2xl", className)}>
      <p
        className={cn(
          "text-[11px] font-semibold uppercase tracking-[0.18em]",
          dark ? "text-sky-300/90" : "text-primary"
        )}
      >
        {eyebrow}
      </p>
      <h2
        className={cn(
          "mt-3 font-[family-name:var(--font-landing-display)] text-3xl font-semibold tracking-[-0.02em] text-balance sm:text-4xl",
          dark ? "text-white" : "text-slate-900"
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            "mt-3 text-base leading-relaxed",
            dark ? "text-slate-300" : "text-slate-600"
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
