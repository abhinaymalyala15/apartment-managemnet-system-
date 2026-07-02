import { CollectionReportView } from "@/components/inspector/reports/collection-report-view";
import {
  getCollectionReportData,
  parseReportQuery,
} from "@/lib/reports-data";

interface PageProps {
  searchParams: Promise<{ block?: string; period?: string }>;
}

export default async function CollectionReportPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const { scope, period } = parseReportQuery(params);
  const data = getCollectionReportData(
    scope,
    "/inspector/reports/collection",
    period
  );
  return <CollectionReportView data={data} />;
}
