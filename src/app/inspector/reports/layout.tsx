import { Suspense } from "react";
import { ReportsNav } from "@/components/inspector/reports/reports-nav";
import { ReportsFilterBar } from "@/components/inspector/reports/reports-filter-bar";

export default function ReportsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="page-stack pb-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Block-wise performance and summaries
        </p>
      </header>
      <ReportsNav />
      <Suspense fallback={null}>
        <div className="mt-4">
          <ReportsFilterBar />
        </div>
      </Suspense>
      <div className="mt-4">{children}</div>
    </div>
  );
}
