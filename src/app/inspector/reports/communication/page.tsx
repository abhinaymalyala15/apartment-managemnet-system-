import { CommunicationReportView } from "@/components/inspector/reports/communication-report-view";
import {
  getCommunicationReportData,
  parseReportQuery,
} from "@/lib/reports-data";

interface PageProps {
  searchParams: Promise<{ block?: string; period?: string }>;
}

export default async function CommunicationReportPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;
  const { scope } = parseReportQuery(params);
  const data = getCommunicationReportData(scope, "/inspector/reports/communication");
  return <CommunicationReportView data={data} />;
}
