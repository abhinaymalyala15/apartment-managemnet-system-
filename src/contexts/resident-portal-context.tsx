"use client";

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { useResidentAuth } from "@/contexts/resident-auth-context";
import {
  buildResidentContext,
  type ResidentPortalContext,
} from "@/lib/resident-context";

const ResidentPortalContext = createContext<ResidentPortalContext | null>(null);

export function ResidentPortalProvider({ children }: { children: ReactNode }) {
  const { user } = useResidentAuth();
  const pathname = usePathname();
  const value = useMemo(
    () => buildResidentContext(user),
    [user, pathname]
  );

  return (
    <ResidentPortalContext.Provider value={value}>
      {children}
    </ResidentPortalContext.Provider>
  );
}

export function useResidentPortal(): ResidentPortalContext {
  const ctx = useContext(ResidentPortalContext);
  if (!ctx) {
    throw new Error("useResidentPortal must be used within ResidentPortalProvider");
  }
  return ctx;
}
