/**
 * Documents workspace registry.
 */
import { routes } from "@/config/routes";

export interface DocumentsModuleDef {
  id: string;
  label: string;
  description: string;
  href: string;
}

export const DOCUMENTS_NAV_MODULES: DocumentsModuleDef[] = [
  {
    id: "society",
    label: "Society",
    description: "Bylaws, AGM minutes, society policies",
    href: routes.dashboard.inspector.settings.documents.society,
  },
  {
    id: "flats",
    label: "Flat documents",
    description: "Ownership, receipts, and agreements by flat",
    href: routes.dashboard.inspector.settings.documents.flats,
  },
  {
    id: "assets",
    label: "Asset documents",
    description: "Manuals, AMC agreements, certificates",
    href: routes.dashboard.inspector.settings.documents.assets,
  },
];

export const DOCUMENT_CATEGORY_LABELS: Record<string, string> = {
  ownership: "Ownership",
  receipt: "Receipt",
  society: "Society",
  other: "Other",
  manual: "Manual",
  amc_agreement: "AMC agreement",
  certificate: "Certificate",
  service_report: "Service report",
  warranty: "Warranty",
};
