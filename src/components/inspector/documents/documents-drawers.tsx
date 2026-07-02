"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDocumentsActions } from "@/components/inspector/documents/documents-provider";

function DemoBanner({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss: () => void;
}) {
  return (
    <div className="rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm">
      <p className="font-medium text-success">{message}</p>
      <p className="mt-1 text-muted-foreground">
        Demo mode — file storage would connect to S3 in production.
      </p>
      <Button size="sm" variant="outline" className="mt-3" onClick={onDismiss}>
        Close
      </Button>
    </div>
  );
}

export function DocumentsDrawers() {
  const { activeAction, closeAction } = useDocumentsActions();

  return (
    <>
      <UploadDrawer
        open={activeAction === "upload-society"}
        onOpenChange={(o) => !o && closeAction()}
        title="Upload society document"
        description="Bylaws, AGM minutes, policies — visible to all residents."
        successMessage="Society document uploaded."
      />
      <UploadDrawer
        open={activeAction === "upload-flat"}
        onOpenChange={(o) => !o && closeAction()}
        title="Upload flat document"
        description="Ownership deed, rental agreement, or receipt for a household."
        successMessage="Flat document uploaded and linked to Flat Operations Hub."
        showFlatField
      />
      <UploadDrawer
        open={activeAction === "upload-asset"}
        onOpenChange={(o) => !o && closeAction()}
        title="Upload asset document"
        description="Manual, AMC agreement, certificate, or service report."
        successMessage="Asset document uploaded to asset profile."
        showAssetField
      />
    </>
  );
}

function UploadDrawer({
  open,
  onOpenChange,
  title,
  description,
  successMessage,
  showFlatField,
  showAssetField,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  successMessage: string;
  showFlatField?: boolean;
  showAssetField?: boolean;
}) {
  const [submitted, setSubmitted] = useState(false);

  const handleOpenChange = (next: boolean) => {
    if (!next) setSubmitted(false);
    onOpenChange(next);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        {submitted ? (
          <div className="mt-6">
            <DemoBanner
              message={successMessage}
              onDismiss={() => handleOpenChange(false)}
            />
          </div>
        ) : (
          <form
            className="mt-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
            }}
          >
            <div className="space-y-1.5">
              <label htmlFor="doc-title" className="text-sm font-medium">
                Document title
              </label>
              <Input id="doc-title" name="title" required />
            </div>
            {showFlatField && (
              <div className="space-y-1.5">
                <label htmlFor="flat-number" className="text-sm font-medium">
                  Flat number
                </label>
                <Input id="flat-number" name="flatNumber" placeholder="e.g. 110" required />
              </div>
            )}
            {showAssetField && (
              <div className="space-y-1.5">
                <label htmlFor="asset-name" className="text-sm font-medium">
                  Asset
                </label>
                <Input id="asset-name" name="asset" placeholder="e.g. Lift A" required />
              </div>
            )}
            <div className="space-y-1.5">
              <label htmlFor="file" className="text-sm font-medium">
                File
              </label>
              <Input id="file" name="file" type="file" required />
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="submit">Upload</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </SheetContent>
    </Sheet>
  );
}
