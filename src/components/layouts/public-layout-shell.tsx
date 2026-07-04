"use client";

import { usePathname } from "next/navigation";
import { PublicHeader, PublicFooter } from "@/components/layout/public-header";

/** Resident auth screens use a centered card — no public header/footer */
const BARE_LAYOUT_PREFIXES = ["/login/resident"];

export function PublicLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isBareAuthRoute = BARE_LAYOUT_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (isBareAuthRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </>
  );
}
