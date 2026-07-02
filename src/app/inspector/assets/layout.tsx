import { ServicesNav } from "@/components/inspector/facility/facility-nav";
import { FacilityProvider } from "@/components/inspector/facility/facility-provider";
import { FacilityDrawers } from "@/components/inspector/facility/facility-drawers";

export default function AssetsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FacilityProvider>
      <div className="page-stack pb-8">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight">Services</h1>
        </header>
        <ServicesNav />
        <div className="mt-2">{children}</div>
      </div>
      <FacilityDrawers />
    </FacilityProvider>
  );
}
