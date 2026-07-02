"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { AdminModuleDef } from "@/config/admin-workspace";

interface AdminModuleGridProps {
  modules: AdminModuleDef[];
  intro?: string;
}

export function AdminModuleGrid({ modules, intro }: AdminModuleGridProps) {
  return (
    <div className="space-y-6">
      {intro && <p className="text-sm text-muted-foreground">{intro}</p>}
      <div className="grid gap-3 sm:grid-cols-2">
        {modules.map((mod) => (
          <Link
            key={mod.id}
            href={mod.href}
            className="surface-card flex items-start justify-between gap-4 p-5 transition-colors hover:bg-muted/30"
          >
            <div>
              <p className="font-medium">{mod.label}</p>
              <p className="mt-1 text-sm text-muted-foreground">{mod.description}</p>
            </div>
            <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          </Link>
        ))}
      </div>
    </div>
  );
}
