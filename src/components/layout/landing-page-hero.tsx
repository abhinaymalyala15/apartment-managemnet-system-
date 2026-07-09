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
  /** Gray mist overlay — blends into dark sections below */
  gradientTone?: "light" | "gray";
  /** Grow to fill a flex/grid parent (used with stats band below) */
  fill?: boolean;
  /** Vertical placement of hero copy */
  contentPosition?: "bottom" | "center";
}

const GRADIENTS = {
  light: {
    linear:
      "linear-gradient(115deg,rgba(243,246,251,0.96)_0%,rgba(243,246,251,0.82)_42%,rgba(20,32,56,0.45)_100%)",
    radial:
      "radial-gradient(ellipse_at_12%_40%,rgba(255,255,255,0.5),transparent_50%)",
  },
  gray: {
    linear:
      "linear-gradient(112deg,rgba(226,232,240,0.68)_0%,rgba(203,213,225,0.42)_34%,rgba(148,163,184,0.22)_62%,rgba(20,32,56,0.32)_100%)",
    radial:
      "radial-gradient(ellipse_at_16%_36%,rgba(248,250,252,0.38),transparent_56%)",
  },
} as const;

export function LandingPageHero({
  eyebrow,
  title,
  description,
  image,
  imageAlt,
  className,
  compact = false,
  gradientTone = "light",
  fill = false,
  contentPosition,
}: LandingPageHeroProps) {
  const gradient = GRADIENTS[gradientTone];
  const position = contentPosition ?? (fill ? "center" : "bottom");

  return (
    <section
      className={cn(
        "relative isolate min-h-0 overflow-hidden",
        fill
          ? "h-full"
          : compact
            ? "min-h-[280px] sm:min-h-[320px]"
            : "min-h-[360px] sm:min-h-[420px]",
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
      <div
        className="absolute inset-0"
        style={{ background: gradient.linear }}
      />
      <div
        className="absolute inset-0"
        style={{ background: gradient.radial }}
      />
      {gradientTone === "gray" && (
        <div className="absolute inset-y-0 left-0 w-[min(100%,44rem)] bg-gradient-to-r from-[#e2e8f0]/75 via-[#cbd5e1]/35 to-transparent" />
      )}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#142038]/90 via-[#142038]/40 to-transparent sm:h-24" />

      <div
        className={cn(
          "relative mx-auto flex h-full max-w-7xl flex-col px-4 sm:px-6 lg:px-8",
          position === "center"
            ? "justify-center py-8 sm:py-10"
            : "justify-end pb-10 pt-20 sm:pb-12 sm:pt-24"
        )}
      >
        <div className="max-w-2xl landing-anim-rise">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
            {eyebrow}
          </p>
          <h1 className="mt-3 font-[family-name:var(--font-landing-display)] text-[clamp(2rem,4.5vw,3.5rem)] font-semibold leading-[1.05] tracking-[-0.03em] text-balance text-slate-900 sm:mt-4">
            {title}
          </h1>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-slate-700 sm:mt-4 sm:text-lg">
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
