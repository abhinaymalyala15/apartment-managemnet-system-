import { OccupancyReportView } from "@/components/inspector/reports/occupancy-report-view";
import {
  getOccupancyReportData,
  parseReportQuery,
} from "@/lib/reports-data";

interface PageProps {
  searchParams: Promise<{ block?: string; period?: string }>;
}

export default async function OccupancyReportPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const { scope } = parseReportQuery(params);
  const data = getOccupancyReportData(scope, "/inspector/reports/occupancy");
  return <OccupancyReportView data={data} />;
}
