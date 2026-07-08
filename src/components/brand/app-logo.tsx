import Image from "next/image";
import Link from "next/link";
import { appConfig } from "@/config/app";
import { cn } from "@/lib/utils";

const sizeMap = {
  xs: 28,
  sm: 36,
  md: 44,
  lg: 56,
  xl: 72,
} as const;

interface AppLogoProps {
  size?: keyof typeof sizeMap;
  showText?: boolean;
  href?: string;
  className?: string;
  textClassName?: string;
  subtitle?: string;
}

export function AppLogo({
  size = "md",
  showText = true,
  href,
  className,
  textClassName,
  subtitle,
}: AppLogoProps) {
  const dimension = sizeMap[size];

  const content = (
    <div className={cn("flex min-w-0 items-center gap-2.5", className)}>
      <Image
        src={appConfig.logoSrc}
        alt={`${appConfig.name} logo`}
        width={dimension}
        height={dimension}
        className="h-auto w-auto shrink-0 object-contain"
        style={{ width: dimension, height: dimension }}
        priority={size === "lg" || size === "xl"}
      />
      {showText && (
        <div className="min-w-0 flex flex-col">
          <span
            className={cn(
              "truncate font-semibold leading-none text-foreground",
              size === "xs" && "text-xs",
              size === "sm" && "text-sm",
              size === "md" && "text-sm",
              size === "lg" && "text-base",
              size === "xl" && "text-lg",
              textClassName
            )}
          >
            {appConfig.name}
          </span>
          {(subtitle ?? appConfig.tagline) && (
            <span
              className={cn(
                "truncate text-muted-foreground",
                size === "xs" && "text-[9px]",
                size === "sm" && "text-[10px]",
                (size === "md" || size === "lg") && "text-[10px]",
                size === "xl" && "text-xs"
              )}
            >
              {subtitle ?? appConfig.tagline}
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="transition-opacity hover:opacity-90">
        {content}
      </Link>
    );
  }

  return content;
}

interface AppLogoMarkProps {
  size?: keyof typeof sizeMap;
  className?: string;
}

export function AppLogoMark({ size = "sm", className }: AppLogoMarkProps) {
  const dimension = sizeMap[size];

  return (
    <Image
      src={appConfig.logoSrc}
      alt={`${appConfig.name} logo`}
      width={dimension}
      height={dimension}
      className={cn("h-auto w-auto shrink-0 object-contain", className)}
      style={{ width: dimension, height: dimension }}
    />
  );
}
