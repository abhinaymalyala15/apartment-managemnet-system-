"use client";

import { useMemo, useState } from "react";
import { FileText } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { ListToolbar } from "@/components/ui/list-toolbar";
import { DocumentList } from "@/components/inspector/documents/document-list";
import { useDocumentsActions } from "@/components/inspector/documents/documents-provider";
import {
  filterDocuments,
  getDocumentCategoriesForScope,
} from "@/lib/documents-data";
import type { DocumentScope, EnrichedDocument } from "@/types";
import { Button } from "@/components/ui/button";

interface DocumentsWorkspaceProps {
  scope: DocumentScope;
  documents: EnrichedDocument[];
  title: string;
  description: string;
  uploadAction: "upload-society" | "upload-flat" | "upload-asset";
}

export function DocumentsWorkspace({
  scope,
  documents,
  title,
  description,
  uploadAction,
}: DocumentsWorkspaceProps) {
  const { openAction } = useDocumentsActions();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const categoryOptions = useMemo(() => {
    const cats = getDocumentCategoriesForScope(scope);
    return [
      { value: "all", label: "All categories" },
      ...cats.map((c) => ({ value: c.value, label: c.label })),
    ];
  }, [scope]);

  const filtered = useMemo(
    () => filterDocuments(documents, search, category),
    [documents, search, category]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        <Button size="sm" onClick={() => openAction(uploadAction)}>
          Upload
        </Button>
      </div>

      <ListToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search title, file name, flat, or asset…"
        filters={[
          {
            id: "category",
            value: category,
            onChange: setCategory,
            placeholder: "Category",
            options: categoryOptions,
          },
        ]}
        resultCount={{ shown: filtered.length, total: documents.length }}
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No documents found"
          description="Try a different search or upload a new document."
        />
      ) : (
        <div className="surface-card overflow-hidden">
          <DocumentList rows={filtered} />
        </div>
      )}
    </div>
  );
}
