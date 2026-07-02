import { DocumentsWorkspace } from "@/components/inspector/documents/documents-workspace";
import { getDocumentsByScope } from "@/lib/documents-data";

export default function FlatDocumentsPage() {
  return (
    <DocumentsWorkspace
      scope="flat"
      documents={getDocumentsByScope("flat")}
      title="Flat documents"
      description="Ownership records, receipts, and agreements by flat."
      uploadAction="upload-flat"
    />
  );
}
