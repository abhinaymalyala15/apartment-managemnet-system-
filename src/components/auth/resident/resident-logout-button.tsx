"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useResidentAuth } from "@/contexts/resident-auth-context";
import { routes } from "@/config/routes";

export function ResidentLogoutButton() {
  const router = useRouter();
  const { logout, user } = useResidentAuth();

  async function handleLogout() {
    await logout();
    router.replace(routes.auth.resident.login);
  }

  if (!user) return null;

  return (
    <div className="surface-card p-4">
      <p className="text-sm font-medium">Signed in as {user.username}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{user.email}</p>
      <Button variant="outline" size="sm" className="mt-3" onClick={handleLogout}>
        <LogOut className="mr-1.5 h-4 w-4" />
        Log out
      </Button>
    </div>
  );
}
