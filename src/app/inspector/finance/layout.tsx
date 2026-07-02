import { MaintenanceNav } from "@/components/inspector/finance/finance-nav";
import { FinanceProvider } from "@/components/inspector/finance/finance-provider";
import { FinanceDrawers } from "@/components/inspector/finance/finance-drawers";

export default function FinanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FinanceProvider>
      <div className="page-stack pb-8">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight">Maintenance</h1>
        </header>
        <MaintenanceNav />
        <div className="mt-2">{children}</div>
      </div>
      <FinanceDrawers />
    </FinanceProvider>
  );
}
