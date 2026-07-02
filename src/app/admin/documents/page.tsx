import { DocumentsProvider } from "@/components/inspector/documents/documents-provider";
import { DocumentsDrawers } from "@/components/inspector/documents/documents-drawers";
import { DocumentsWorkspace } from "@/components/inspector/documents/documents-workspace";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { getDocumentsByScope } from "@/lib/documents-data";

export default function AdminDocumentsPage() {
  return (
    <DocumentsProvider>
      <div className="page-stack pb-8">
        <AdminPageHeader
          title="Documents"
          description="Society bylaws, forms, policies, certificates, and insurance."
        />
        <DocumentsWorkspace
          scope="society"
          documents={getDocumentsByScope("society")}
          title="Society documents"
          description="Bylaws, AGM minutes, forms, and society policies. Admin-only uploads."
          uploadAction="upload-society"
        />
      </div>
      <DocumentsDrawers />
    </DocumentsProvider>
  );
}
