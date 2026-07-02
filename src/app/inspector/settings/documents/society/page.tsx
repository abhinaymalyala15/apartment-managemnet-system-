import { DocumentsWorkspace } from "@/components/inspector/documents/documents-workspace";
import { getDocumentsByScope } from "@/lib/documents-data";

export default function SocietyDocumentsPage() {
  return (
    <DocumentsWorkspace
      scope="society"
      documents={getDocumentsByScope("society")}
      title="Society documents"
      description="Bylaws, AGM minutes, and society policies."
      uploadAction="upload-society"
    />
  );
}
