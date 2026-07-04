import Link from "next/link";
import { LogIn, UserPlus } from "lucide-react";
import { AuthLayout } from "@/components/auth/auth-layout";
import { routes } from "@/config/routes";

export function ResidentAuthEntry() {
  return (
    <AuthLayout
      title="Resident portal"
      subtitle="Sign in to your account or create a new one."
    >
      <div className="grid gap-3">
        <Link
          href={routes.auth.resident.login}
          className="flex items-center gap-4 rounded-xl border bg-background p-4 transition-colors hover:border-primary/40 hover:bg-muted/40"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <LogIn className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0 text-left">
            <p className="font-medium">Login</p>
            <p className="text-sm text-muted-foreground">Access your resident dashboard</p>
          </div>
        </Link>

        <Link
          href={routes.auth.resident.register}
          className="flex items-center gap-4 rounded-xl border bg-background p-4 transition-colors hover:border-primary/40 hover:bg-muted/40"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <UserPlus className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0 text-left">
            <p className="font-medium">Create account</p>
            <p className="text-sm text-muted-foreground">Register for resident portal access</p>
          </div>
        </Link>
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link href={routes.public.login} className="text-primary hover:underline">
          Other portals
        </Link>
        {" · "}
        <Link href={routes.public.home} className="text-primary hover:underline">
          Back to home
        </Link>
      </p>
    </AuthLayout>
  );
}
