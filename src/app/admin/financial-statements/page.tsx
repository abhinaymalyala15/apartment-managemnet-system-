import Link from "next/link";
import { FileSpreadsheet, Plus } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ButtonLink } from "@/components/ui/button-link";
import { routes } from "@/config/routes";

export default function AdminFinancialStatementsPage() {
  return (
    <div className="page-stack">
      <AdminPageHeader
        title="Balance Sheet"
        description="Create and publish monthly expense statements for Inspector and Resident portals."
        action={
          <ButtonLink
            href={routes.dashboard.admin.financialStatements.create}
            size="lg"
          >
            <Plus className="h-4 w-4" />
            Create statement
          </ButtonLink>
        }
      />

      <section className="admin-panel">
        <div className="flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Monthly expense register
              </h2>
              <p className="mt-1 max-w-xl text-sm text-slate-600">
                Draft a balance sheet for the month, preview it, then publish. Published
                sheets appear automatically under Balance Sheet in Inspector and Resident
                portals (view &amp; print only).
              </p>
            </div>
          </div>
          <ButtonLink
            href={routes.dashboard.admin.financialStatements.create}
            variant="outline"
          >
            Open editor
          </ButtonLink>
        </div>
        <div className="border-t border-slate-100 bg-slate-50/80 px-6 py-3 text-xs text-slate-500">
          Tip: after publishing, open{" "}
          <Link
            href={routes.dashboard.inspector.financialStatements}
            className="font-medium text-primary underline-offset-2 hover:underline"
          >
            Inspector → Balance Sheet
          </Link>{" "}
          or{" "}
          <Link
            href={routes.dashboard.resident.financialStatements}
            className="font-medium text-primary underline-offset-2 hover:underline"
          >
            Resident → Balance Sheet
          </Link>{" "}
          to verify.
        </div>
      </section>
    </div>
  );
}
