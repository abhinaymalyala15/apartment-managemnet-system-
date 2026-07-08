import { FinancialStatementEditor } from "@/components/admin/financial-statements/financial-statement-editor";
import { getApartment } from "@/lib/data";

export default function AdminFinancialStatementCreatePage() {
  const apartment = getApartment();

  return (
    <FinancialStatementEditor
      buildingName={apartment.name}
      preparedBy="Apartment Administrator"
    />
  );
}
