"use client";

import { useSearchParams } from "next/navigation";
import { FinancialStatementEditor } from "@/components/admin/financial-statements/financial-statement-editor";

interface FinancialStatementCreateClientProps {
  buildingName: string;
  preparedBy: string;
}

export function FinancialStatementCreateClient({
  buildingName,
  preparedBy,
}: FinancialStatementCreateClientProps) {
  const searchParams = useSearchParams();
  const statementId = searchParams.get("id");

  return (
    <FinancialStatementEditor
      buildingName={buildingName}
      preparedBy={preparedBy}
      statementId={statementId ?? undefined}
    />
  );
}
