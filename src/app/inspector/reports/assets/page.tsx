import { AssetReportView } from "@/components/inspector/reports/asset-report-view";
import {
  getAssetReportData,
  parseReportQuery,
} from "@/lib/reports-data";

interface PageProps {
  searchParams: Promise<{ block?: string; period?: string }>;
}

export default async function AssetReportPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const { scope } = parseReportQuery(params);
  const data = getAssetReportData(scope, "/inspector/reports/assets");
  return <AssetReportView data={data} />;
}
