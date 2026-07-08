import Link from "next/link";
import {
  ArrowRight,
  ClipboardList,
  Shield,
  User,
} from "lucide-react";
import { AuthShell } from "@/components/auth/auth-layout";
import { routes } from "@/config/routes";
import { getApartment } from "@/lib/data";
import { cn } from "@/lib/utils";

const portals = [
  {
    href: routes.auth.resident.entry,
    title: "Resident",
    description: "Sign in or create a resident account",
    icon: User,
    tone: "bg-sky-50 text-sky-700 ring-sky-200/80",
  },
  {
    href: routes.dashboard.inspector.root,
    title: "Inspector",
    description: "Daily ops · residents, dues, notices",
    icon: ClipboardList,
    tone: "bg-teal-50 text-teal-700 ring-teal-200/80",
  },
  {
    href: routes.dashboard.admin.root,
    title: "Admin",
    description: "Setup · flats, billing, balance sheet",
    icon: Shield,
    tone: "bg-indigo-50 text-indigo-700 ring-indigo-200/80",
  },
];

export default function LoginPage() {
  const apartment = getApartment();

  return (
    <AuthShell width="chooser" showHomeLink>
      <div className="text-center">
        <h1 className="font-[family-name:var(--font-landing-display)] text-2xl font-semibold tracking-tight text-slate-900">
          Choose your portal
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          Access {apartment.name} as a resident, inspector, or admin.
        </p>
      </div>

      <div className="mt-7 space-y-2.5">
        {portals.map((portal) => (
          <Link
            key={portal.href}
            href={portal.href}
            className="group flex items-center gap-4 rounded-2xl border border-slate-200/90 bg-[#f8fafc] p-4 transition-[border-color,background-color,box-shadow,transform] duration-200 ease-out hover:-translate-y-0.5 hover:border-primary/25 hover:bg-white hover:shadow-[0_10px_30px_rgba(15,23,42,0.06)]"
          >
            <div
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1",
                portal.tone
              )}
            >
              <portal.icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1 text-left">
              <h2 className="font-semibold text-slate-900">{portal.title}</h2>
              <p className="text-sm text-slate-500">{portal.description}</p>
            </div>
            <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition-colors group-hover:text-primary" />
          </Link>
        ))}
      </div>
    </AuthShell>
  );
}
