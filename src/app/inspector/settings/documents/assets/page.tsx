import { DocumentsWorkspace } from "@/components/inspector/documents/documents-workspace";
import { getDocumentsByScope } from "@/lib/documents-data";

export default function AssetDocumentsPage() {
  return (
    <DocumentsWorkspace
      scope="asset"
      documents={getDocumentsByScope("asset")}
      title="Asset documents"
      description="Manuals, AMC agreements, and certificates."
      uploadAction="upload-asset"
    />
  );
}
