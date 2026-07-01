import Link from "next/link";
import {
  Wallet,
  Bell,
  Home,
  Users,
  Wrench,
  User,
  ArrowRight,
} from "lucide-react";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";

const root = routes.dashboard.resident.root;

const primaryTiles = [
  {
    label: "Bills",
    href: `${root}/payments`,
    icon: Wallet,
    tint: "from-emerald-500/15 to-emerald-500/5 border-emerald-200/60",
    iconBg: "bg-emerald-500/15 text-emerald-700",
  },
  {
    label: "News",
    href: `${root}/notices`,
    icon: Bell,
    tint: "from-sky-500/15 to-sky-500/5 border-sky-200/60",
    iconBg: "bg-sky-500/15 text-sky-700",
  },
  {
    label: "My flat",
    href: `${root}/flat`,
    icon: Home,
    tint: "from-violet-500/15 to-violet-500/5 border-violet-200/60",
    iconBg: "bg-violet-500/15 text-violet-700",
  },
  {
    label: "Family",
    href: `${root}/family`,
    icon: Users,
    tint: "from-amber-500/15 to-amber-500/5 border-amber-200/60",
    iconBg: "bg-amber-500/15 text-amber-700",
  },
];

const secondaryLinks = [
  { label: "Society visits", href: `${root}/services`, icon: Wrench },
  { label: "My account", href: `${root}/profile`, icon: User },
];

export function ResidentQuickTiles() {
  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-foreground">Quick access</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {primaryTiles.map((tile) => (
          <Link
            key={tile.href}
            href={tile.href}
            className={cn(
              "group flex flex-col items-center gap-3 rounded-2xl border bg-gradient-to-b p-4 text-center shadow-sm transition-all hover:shadow-md",
              tile.tint
            )}
          >
            <div
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-xl",
                tile.iconBg
              )}
            >
              <tile.icon className="h-5 w-5" />
            </div>
            <span className="text-sm font-medium">{tile.label}</span>
          </Link>
        ))}
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {secondaryLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center justify-between rounded-xl border bg-card px-4 py-3 text-sm font-medium shadow-sm transition-colors hover:bg-muted/50"
          >
            <span className="flex items-center gap-2.5">
              <link.icon className="h-4 w-4 text-muted-foreground" />
              {link.label}
            </span>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </Link>
        ))}
      </div>
    </div>
  );
}
