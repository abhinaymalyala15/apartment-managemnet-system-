import { MaintenanceReportView } from "@/components/inspector/reports/maintenance-report-view";
import {
  getMaintenanceReportData,
  parseReportQuery,
} from "@/lib/reports-data";

interface PageProps {
  searchParams: Promise<{ block?: string; period?: string }>;
}

export default async function MaintenanceReportPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;
  const { scope } = parseReportQuery(params);
  const data = getMaintenanceReportData(scope, "/inspector/reports/maintenance");
  return <MaintenanceReportView data={data} />;
}
