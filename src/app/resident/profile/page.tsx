"use client";

import { ResidentPageHeader } from "@/components/resident/resident-page-header";
import { ResidentContent } from "@/components/resident/resident-content";
import { ResidentSummary } from "@/components/resident/resident-summary";
import { ResidentLogoutButton } from "@/components/auth/resident/resident-logout-button";
import { useResidentPortal } from "@/contexts/resident-portal-context";

export default function ResidentProfilePage() {
  const ctx = useResidentPortal();

  return (
    <>
      <ResidentPageHeader
        title="My details"
        description="Everything about you, your flat, bills, and society — in one place."
        showBack={false}
      />

      <ResidentContent>
        <ResidentLogoutButton />
        <ResidentSummary
          resident={ctx.resident}
          flat={ctx.flat}
          block={ctx.block}
          owner={ctx.owner}
          family={ctx.family}
          payments={ctx.payments}
        />
      </ResidentContent>
    </>
  );
}
