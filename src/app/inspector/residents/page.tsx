import { Suspense } from "react";
import { getResidentTableRows } from "@/lib/data";
import { ResidentDirectoryPanel } from "@/components/inspector/residents/resident-directory-panel";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminResidentsPage() {
  const rows = getResidentTableRows();

  return (
    <div className="page-stack pb-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Residents</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Search households and open flat records.
        </p>
      </header>

      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <ResidentDirectoryPanel rows={rows} />
      </Suspense>
    </div>
  );
}
