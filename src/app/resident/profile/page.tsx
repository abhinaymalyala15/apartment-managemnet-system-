import { ResidentPageHeader } from "@/components/resident/resident-page-header";
import { ResidentContent } from "@/components/resident/resident-content";
import { ResidentSummary } from "@/components/resident/resident-summary";
import { ResidentLogoutButton } from "@/components/auth/resident/resident-logout-button";
import { getResidentContext } from "@/lib/resident-context";

export default function ResidentProfilePage() {
  const ctx = getResidentContext();

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
