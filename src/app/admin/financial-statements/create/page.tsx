import { Suspense } from "react";
import { FinancialStatementCreateClient } from "@/components/admin/financial-statements/financial-statement-create-client";
import { getApartment } from "@/lib/data";

export default function AdminFinancialStatementCreatePage() {
  const apartment = getApartment();

  return (
    <Suspense fallback={null}>
      <FinancialStatementCreateClient
        buildingName={apartment.name}
        preparedBy="Apartment Administrator"
      />
    </Suspense>
  );
}
