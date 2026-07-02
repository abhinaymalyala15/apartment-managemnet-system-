import { DocumentsNav } from "@/components/inspector/documents/documents-nav";
import { DocumentsProvider } from "@/components/inspector/documents/documents-provider";
import { DocumentsDrawers } from "@/components/inspector/documents/documents-drawers";

export default function SettingsDocumentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DocumentsProvider>
      <div className="space-y-4">
        <DocumentsNav />
        {children}
      </div>
      <DocumentsDrawers />
    </DocumentsProvider>
  );
}
