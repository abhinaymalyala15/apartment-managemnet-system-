"use client";

import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Pencil, Trash2 } from "lucide-react";

export function ServiceRowActions({
  isPublished,
  confirmRemove,
  onEdit,
  onTogglePublish,
  onRemove,
  onConfirmRemove,
  onCancelRemove,
}: {
  isPublished: boolean;
  confirmRemove: boolean;
  onEdit: () => void;
  onTogglePublish: () => void;
  onRemove: () => void;
  onConfirmRemove: () => void;
  onCancelRemove: () => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button size="sm" variant="outline" onClick={onEdit}>
        <Pencil className="mr-1.5 h-3.5 w-3.5" />
        Edit
      </Button>
      <Button size="sm" variant="outline" onClick={onTogglePublish}>
        {isPublished ? (
          <>
            <EyeOff className="mr-1.5 h-3.5 w-3.5" />
            Unpublish
          </>
        ) : (
          <>
            <Eye className="mr-1.5 h-3.5 w-3.5" />
            Publish
          </>
        )}
      </Button>
      {confirmRemove ? (
        <>
          <Button size="sm" variant="destructive" onClick={onConfirmRemove}>
            Confirm remove
          </Button>
          <Button size="sm" variant="ghost" onClick={onCancelRemove}>
            Cancel
          </Button>
        </>
      ) : (
        <Button
          size="sm"
          variant="outline"
          className="text-destructive hover:text-destructive"
          onClick={onRemove}
        >
          <Trash2 className="mr-1.5 h-3.5 w-3.5" />
          Remove
        </Button>
      )}
    </div>
  );
}
