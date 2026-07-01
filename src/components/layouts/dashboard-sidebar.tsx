"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { appConfig } from "@/config/app";
import { routes } from "@/config/routes";
import type { RoleNavConfig } from "@/config/navigation";
import { ButtonLink } from "@/components/ui/button-link";

interface DashboardSidebarProps {
  config: RoleNavConfig;
}

export function DashboardSidebar({ config }: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      <div className="flex h-16 items-center gap-2.5 border-b px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
          <Building2 className="h-5 w-5 text-primary-foreground" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{appConfig.name}</p>
          <p className="truncate text-[10px] text-muted-foreground">
            {config.label}
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto p-4">
        {config.groups.map((group) => (
          <div key={group.label}>
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== routes.dashboard[config.role].root &&
                    pathname.startsWith(item.href));

                if (item.disabled) {
                  return (
                    <span
                      key={item.href}
                      className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground/50"
                      title={`Available in Phase ${item.phase}`}
                    >
                      <item.icon className="h-4 w-4" />
                      <span className="flex-1">{item.label}</span>
                      {item.phase && (
                        <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium">
                          P{item.phase}
                        </span>
                      )}
                    </span>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t p-4">
        <div className="mb-3 rounded-lg bg-muted/50 px-3 py-2.5">
          <p className="truncate text-sm font-medium">{config.userDisplayName}</p>
          <p className="truncate text-xs text-muted-foreground">
            {config.userSubtitle}
          </p>
        </div>
        <ButtonLink
          variant="outline"
          size="sm"
          className="w-full"
          href={routes.public.login}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Exit
        </ButtonLink>
      </div>
    </>
  );
}
