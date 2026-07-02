import { FinancialReportView } from "@/components/inspector/reports/financial-report-view";
import {
  getFinancialReportData,
  parseReportQuery,
} from "@/lib/reports-data";

interface PageProps {
  searchParams: Promise<{ block?: string; period?: string }>;
}

export default async function FinancialReportPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const { scope, period } = parseReportQuery(params);
  const data = getFinancialReportData(
    scope,
    "/inspector/reports/financial",
    period
  );
  return <FinancialReportView data={data} />;
}
