import { MovementReportView } from "@/components/inspector/reports/movement-report-view";
import {
  getMovementReportData,
  parseReportQuery,
} from "@/lib/reports-data";

interface PageProps {
  searchParams: Promise<{ block?: string; period?: string }>;
}

export default async function MovementReportPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const { scope } = parseReportQuery(params);
  const data = getMovementReportData(scope, "/inspector/reports/movement");
  return <MovementReportView data={data} />;
}
