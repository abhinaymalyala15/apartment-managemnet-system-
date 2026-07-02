"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { formatDate } from "@/lib/documents-data";
import type { EnrichedDocument } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const scopeLabels = {
  society: "Society",
  flat: "Flat",
  asset: "Asset",
} as const;

export function DocumentList({ rows }: { rows: EnrichedDocument[] }) {
  if (rows.length === 0) {
    return (
      <p className="px-4 py-8 text-center text-sm text-muted-foreground sm:px-5">
        No documents in this view.
      </p>
    );
  }

  return (
    <ul className="divide-y">
      {rows.map((doc) => {
        const meta = [
          doc.categoryLabel,
          formatDate(doc.uploadedAt),
          doc.fileLabel,
        ].join(" · ");

        const context =
          doc.scope === "flat"
            ? `Flat ${doc.flatNumber}`
            : doc.scope === "asset"
              ? doc.assetName
              : "Society-wide";

        const inner = (
          <>
            <div className="min-w-0">
              <p className="font-medium">{doc.title}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">{meta}</p>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="text-[10px] capitalize">
                  {scopeLabels[doc.scope]}
                </Badge>
                {context && (
                  <span className="text-xs text-muted-foreground">{context}</span>
                )}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Button size="sm" variant="outline" className="h-8 text-xs">
                Download
              </Button>
              {doc.href && (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </>
        );

        if (doc.href) {
          return (
            <li key={doc.id}>
              <Link
                href={doc.href}
                className="flex items-center justify-between gap-4 px-4 py-4 transition-colors hover:bg-muted/50 sm:px-5"
              >
                {inner}
              </Link>
            </li>
          );
        }

        return (
          <li
            key={doc.id}
            className="flex items-center justify-between gap-4 px-4 py-4 sm:px-5"
          >
            {inner}
          </li>
        );
      })}
    </ul>
  );
}
