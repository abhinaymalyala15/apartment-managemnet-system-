import { Badge } from "@/components/ui/badge";
import {
  getAssetCategoryLabel,
  getAssetStatusLabel,
  getFacilityScopeLabel,
} from "@/lib/asset-data";
import type { CommunityAsset } from "@/types";
import { cn } from "@/lib/utils";
import {
  ArrowUpDown,
  Camera,
  Droplets,
  Flame,
  Flower2,
  HelpCircle,
  Sun,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const CATEGORY_ICONS: Partial<Record<CommunityAsset["assetType"], LucideIcon>> = {
  lift: ArrowUpDown,
  water_tank: Droplets,
  generator: Zap,
  fire_safety: Flame,
  cctv: Camera,
  garden: Flower2,
  solar: Sun,
};

interface AssetStatusBadgeProps {
  status: CommunityAsset["status"];
  className?: string;
}

export function AssetStatusBadge({ status, className }: AssetStatusBadgeProps) {
  const variant =
    status === "amc_overdue" || status === "under_maintenance"
      ? "destructive"
      : status === "service_due_soon"
        ? "secondary"
        : status === "inactive"
          ? "outline"
          : "default";

  return (
    <Badge variant={variant} className={cn("text-[10px]", className)}>
      {getAssetStatusLabel(status)}
    </Badge>
  );
}

interface AssetTypeIconProps {
  assetType: CommunityAsset["assetType"];
  className?: string;
}

export function AssetTypeIcon({ assetType, className }: AssetTypeIconProps) {
  const Icon = CATEGORY_ICONS[assetType] ?? HelpCircle;
  return (
    <div
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10",
        className
      )}
    >
      <Icon className="h-5 w-5 text-primary" />
    </div>
  );
}

interface AssetCardProps {
  asset: CommunityAsset;
  blockName?: string;
  actions?: React.ReactNode;
  compact?: boolean;
}

export function AssetCard({
  asset,
  blockName,
  actions,
  compact,
}: AssetCardProps) {
  return (
    <article className="surface-card p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <AssetTypeIcon assetType={asset.assetType} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold">{asset.name}</h3>
            <AssetStatusBadge status={asset.status} />
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {getAssetCategoryLabel(asset.assetType)}
            {asset.location && ` · ${asset.location}`}
          </p>
          {!compact && (
            <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">Scope</dt>
                <dd className="font-medium">
                  {getFacilityScopeLabel(asset.scope)}
                  {blockName && ` · ${blockName}`}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Vendor</dt>
                <dd className="font-medium">{asset.vendor}</dd>
              </div>
              {asset.nextServiceDate && (
                <div>
                  <dt className="text-muted-foreground">Next service</dt>
                  <dd className="font-medium">{asset.nextServiceDate}</dd>
                </div>
              )}
              <div>
                <dt className="text-muted-foreground">AMC expires</dt>
                <dd className="font-medium">{asset.amcExpiryDate}</dd>
              </div>
            </dl>
          )}
          {actions && <div className="mt-3">{actions}</div>}
        </div>
      </div>
    </article>
  );
}
