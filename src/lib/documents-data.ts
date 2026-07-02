/**
 * Documents data layer — society, flat, and asset documents in one index.
 */
import assetDocumentsData from "@/data/asset-documents.json";
import { DOCUMENT_CATEGORY_LABELS } from "@/config/documents-workspace";
import { routes } from "@/config/routes";
import { getCommunityAssets } from "@/lib/asset-data";
import {
  formatDate,
  getDocuments,
  getFlatById,
} from "@/lib/data";
import type {
  AssetDocument,
  DocumentScope,
  DocumentsSummary,
  EnrichedDocument,
  ResidentDocument,
} from "@/types";

const assetDocuments = assetDocumentsData as AssetDocument[];

function categoryLabel(category: string): string {
  return DOCUMENT_CATEGORY_LABELS[category] ?? category.replace(/_/g, " ");
}

function enrichResidentDocument(doc: ResidentDocument): EnrichedDocument {
  const isSociety = !doc.flatId && doc.category === "society";
  const flat = doc.flatId ? getFlatById(doc.flatId) : undefined;

  return {
    id: doc.id,
    title: doc.title,
    category: doc.category,
    categoryLabel: categoryLabel(doc.category),
    uploadedAt: doc.uploadedAt,
    fileLabel: doc.fileLabel,
    scope: isSociety ? "society" : "flat",
    flatId: doc.flatId,
    flatNumber: flat?.flatNumber,
    href: doc.flatId
      ? routes.dashboard.inspector.flats.detail(doc.flatId)
      : undefined,
  };
}

function enrichAssetDocument(doc: AssetDocument): EnrichedDocument {
  const asset = getCommunityAssets().find((a) => a.id === doc.assetId);
  return {
    id: doc.id,
    title: doc.title,
    category: doc.category,
    categoryLabel: categoryLabel(doc.category),
    uploadedAt: doc.uploadedAt,
    fileLabel: doc.fileLabel,
    scope: "asset",
    assetId: doc.assetId,
    assetName: asset?.name,
    href: routes.dashboard.inspector.services.asset(doc.assetId),
  };
}

export function getAllEnrichedDocuments(): EnrichedDocument[] {
  const resident = getDocuments().map(enrichResidentDocument);
  const assets = assetDocuments.map(enrichAssetDocument);
  return [...resident, ...assets].sort(
    (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
  );
}

export function getDocumentsByScope(scope: DocumentScope): EnrichedDocument[] {
  return getAllEnrichedDocuments().filter((d) => d.scope === scope);
}

export function getDocumentsSummary(): DocumentsSummary {
  const all = getAllEnrichedDocuments();
  return {
    total: all.length,
    societyCount: all.filter((d) => d.scope === "society").length,
    flatCount: all.filter((d) => d.scope === "flat").length,
    assetCount: all.filter((d) => d.scope === "asset").length,
    recent: all.slice(0, 6),
  };
}

export function filterDocuments(
  docs: EnrichedDocument[],
  query: string,
  categoryFilter: string = "all"
): EnrichedDocument[] {
  const q = query.trim().toLowerCase();
  return docs.filter((doc) => {
    if (categoryFilter !== "all" && doc.category !== categoryFilter) return false;
    if (!q) return true;
    return (
      doc.title.toLowerCase().includes(q) ||
      doc.fileLabel.toLowerCase().includes(q) ||
      doc.categoryLabel.toLowerCase().includes(q) ||
      (doc.flatNumber?.toLowerCase().includes(q) ?? false) ||
      (doc.assetName?.toLowerCase().includes(q) ?? false)
    );
  });
}

export function getDocumentCategoriesForScope(
  scope: DocumentScope
): Array<{ value: string; label: string }> {
  const docs = getDocumentsByScope(scope);
  const cats = [...new Set(docs.map((d) => d.category))];
  return cats.map((c) => ({ value: c, label: categoryLabel(c) }));
}

export { formatDate };
