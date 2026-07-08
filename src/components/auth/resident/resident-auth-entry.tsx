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
      <div className="grid gap-2.5">
        <Link
          href={routes.auth.resident.login}
          className="flex items-center gap-4 rounded-2xl border border-slate-200/90 bg-[#f8fafc] p-4 transition-colors hover:border-primary/25 hover:bg-white"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-700 ring-1 ring-sky-200/80">
            <LogIn className="h-5 w-5" />
          </div>
          <div className="min-w-0 text-left">
            <p className="font-medium text-slate-900">Login</p>
            <p className="text-sm text-slate-500">Access your resident dashboard</p>
          </div>
        </Link>

        <Link
          href={routes.auth.resident.register}
          className="flex items-center gap-4 rounded-2xl border border-slate-200/90 bg-[#f8fafc] p-4 transition-colors hover:border-primary/25 hover:bg-white"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200/80">
            <UserPlus className="h-5 w-5" />
          </div>
          <div className="min-w-0 text-left">
            <p className="font-medium text-slate-900">Create account</p>
            <p className="text-sm text-slate-500">Register for resident portal access</p>
          </div>
        </Link>
      </div>

      <p className="mt-6 text-center text-sm text-slate-500">
        <Link href={routes.public.login} className="font-medium text-primary hover:underline">
          Other portals
        </Link>
      </p>
    </AuthLayout>
  );
}
