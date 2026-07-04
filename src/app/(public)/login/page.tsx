import Link from "next/link";
import {
  User,
  ClipboardList,
  Shield,
  ArrowRight,
} from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import { routes } from "@/config/routes";
import { getApartment } from "@/lib/data";

const portals = [
  {
    href: routes.auth.resident.entry,
    title: "Resident",
    description: "Sign in or create a resident account",
    icon: User,
  },
  {
    href: routes.dashboard.inspector.root,
    title: "Inspector",
    description: "Apartment management · daily operations",
    icon: ClipboardList,
  },
  {
    href: routes.dashboard.admin.root,
    title: "Admin",
    description: "Apartment configuration · build the society",
    icon: Shield,
  },
];

export default function LoginPage() {
  const apartment = getApartment();

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Portal access</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in as resident, apartment inspector, or apartment admin for{" "}
            {apartment.name}. Full authentication arrives in Phase 2.
          </p>
        </div>

        <div className="mt-8 space-y-3">
          {portals.map((portal) => (
            <Link
              key={portal.href}
              href={portal.href}
              className="group flex items-center gap-4 rounded-xl border bg-card p-5 shadow-sm transition-all hover:border-primary/50 hover:shadow-md"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                <portal.icon className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1 text-left">
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold">{portal.title}</h2>
                  <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                    Shell
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {portal.description}
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
            </Link>
          ))}
        </div>

        <div className="mt-6 text-center">
          <ButtonLink variant="link" size="sm" href={routes.public.home}>
            ← Back to home
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
