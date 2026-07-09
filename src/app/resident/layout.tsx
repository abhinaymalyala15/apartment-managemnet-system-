"use client";

import { ResidentAuthGuard } from "@/components/auth/resident/resident-auth-guard";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { ResidentBottomNav } from "@/components/resident/resident-bottom-nav";
import { ResidentAuthProvider, useResidentAuth } from "@/contexts/resident-auth-context";
import { ResidentPortalProvider } from "@/contexts/resident-portal-context";
import type { RoleNavConfig } from "@/config/navigation";
import { roleNavigation } from "@/config/navigation";

function ResidentShell({ children }: { children: React.ReactNode }) {
  const { user } = useResidentAuth();
  const baseConfig = roleNavigation.resident;

  const navConfig: RoleNavConfig = user
    ? {
        ...baseConfig,
        userDisplayName: user.fullName,
        userSubtitle: user.flatNumber ? `Flat ${user.flatNumber}` : "Resident account",
      }
    : baseConfig;

  return (
    <DashboardLayout
      role="resident"
      footer={<ResidentBottomNav />}
      navConfig={navConfig}
    >
      {children}
    </DashboardLayout>
  );
}

export default function ResidentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ResidentAuthProvider>
      <ResidentAuthGuard>
        <ResidentPortalProvider>
          <ResidentShell>{children}</ResidentShell>
        </ResidentPortalProvider>
      </ResidentAuthGuard>
    </ResidentAuthProvider>
  );
}
