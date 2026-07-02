import { FacilityProvider } from "@/components/inspector/facility/facility-provider";
import { FacilityDrawers } from "@/components/inspector/facility/facility-drawers";

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FacilityProvider>
      <div className="page-stack pb-8">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight">Services</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Scheduled maintenance and vendor visits
          </p>
        </header>
        <div className="mt-2">{children}</div>
      </div>
      <FacilityDrawers />
    </FacilityProvider>
  );
}
