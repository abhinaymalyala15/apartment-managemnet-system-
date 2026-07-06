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
  onNavigate?: () => void;
}

export function DashboardSidebar({ config, onNavigate }: DashboardSidebarProps) {
  const pathname = usePathname();
  const isAdmin = config.role === "admin";

  return (
    <>
      <div
        className={cn(
          "flex h-16 items-center gap-3 border-b px-4",
          isAdmin ? "border-slate-800 bg-slate-900" : "border-border bg-card"
        )}
      >
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl shadow-lg",
            isAdmin
              ? "bg-gradient-to-br from-primary to-violet-600 shadow-primary/30"
              : "rounded-lg bg-primary"
          )}
        >
          <Building2 className="h-5 w-5 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "truncate text-sm font-bold",
              isAdmin ? "text-white" : "font-semibold"
            )}
          >
            {appConfig.name}
          </p>
          <p
            className={cn(
              "truncate text-[10px] font-medium uppercase tracking-wider",
              isAdmin ? "text-slate-400" : "text-muted-foreground"
            )}
          >
            {config.label}
          </p>
        </div>
      </div>

      <nav className={cn("flex-1 overflow-y-auto p-3", isAdmin && "px-3 py-4")}>
        {config.groups.map((group) => (
          <div key={group.label || "main"} className={group.label ? "mt-4 first:mt-0" : ""}>
            {group.label ? (
              <p
                className={cn(
                  "mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.12em]",
                  isAdmin ? "text-slate-500" : "font-semibold text-muted-foreground"
                )}
              >
                {group.label}
              </p>
            ) : null}
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== routes.dashboard[config.role].root &&
                    pathname.startsWith(item.href));

                if (item.disabled) {
                  return (
                    <span
                      key={item.href}
                      className={cn(
                        "flex cursor-not-allowed items-center gap-3 rounded-xl px-3 py-2.5 text-sm",
                        isAdmin
                          ? "text-slate-600"
                          : "text-muted-foreground/50"
                      )}
                      title={`Available in Phase ${item.phase}`}
                    >
                      <item.icon className="h-4 w-4" />
                      <span className="flex-1">{item.label}</span>
                      {item.phase && (
                        <span
                          className={cn(
                            "rounded px-1.5 py-0.5 text-[10px] font-medium",
                            isAdmin ? "bg-slate-800 text-slate-500" : "bg-muted"
                          )}
                        >
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
                    onClick={onNavigate}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                      isActive
                        ? isAdmin
                          ? "bg-white/10 text-white shadow-sm ring-1 ring-white/10"
                          : "bg-primary text-primary-foreground"
                        : isAdmin
                          ? "text-slate-400 hover:bg-white/5 hover:text-slate-100"
                          : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
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

      <div className={cn("border-t p-3", isAdmin && "border-slate-800 bg-slate-950/40")}>
        <div
          className={cn(
            "mb-3 rounded-xl px-3 py-3",
            isAdmin
              ? "border border-slate-700/80 bg-slate-800/60"
              : "rounded-lg bg-muted/50"
          )}
        >
          <p className={cn("truncate text-sm font-semibold", isAdmin && "text-white")}>
            {config.userDisplayName}
          </p>
          <p className={cn("truncate text-xs", isAdmin ? "text-slate-400" : "text-muted-foreground")}>
            {config.userSubtitle}
          </p>
        </div>
        <ButtonLink
          variant="outline"
          size="sm"
          className={cn(
            "w-full",
            isAdmin &&
              "border-slate-600 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white"
          )}
          href={routes.public.login}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Exit
        </ButtonLink>
      </div>
    </>
  );
}
