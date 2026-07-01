"use client";

import { Wallet, Bell, Users, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

const actions = [
  { label: "Pay Dues", icon: Wallet, tab: "payments" },
  { label: "Notices", icon: Bell, tab: "notices" },
  { label: "Family", icon: Users, tab: "overview" },
  { label: "Services", icon: Wrench, tab: "services" },
];

interface QuickActionsProps {
  onSelect?: (tab: string) => void;
}

export function QuickActions({ onSelect }: QuickActionsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {actions.map((action) => (
        <button
          key={action.label}
          type="button"
          onClick={() => onSelect?.(action.tab)}
          className={cn(
            "flex flex-col items-center gap-2 rounded-xl border bg-card p-4 text-center shadow-sm transition-all",
            "hover:border-primary/40 hover:bg-primary/5 hover:shadow-md",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          )}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <action.icon className="h-5 w-5 text-primary" />
          </div>
          <span className="text-sm font-medium">{action.label}</span>
        </button>
      ))}
    </div>
  );
}
