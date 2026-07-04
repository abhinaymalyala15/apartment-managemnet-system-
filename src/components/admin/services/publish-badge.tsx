"use client";

import { Badge } from "@/components/ui/badge";
import type { ServicePublishStatus } from "@/types";

export function PublishBadge({ status }: { status: ServicePublishStatus }) {
  if (status === "published") {
    return (
      <Badge variant="default" className="text-[10px]">
        Published
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-[10px] text-amber-700">
      Draft
    </Badge>
  );
}
