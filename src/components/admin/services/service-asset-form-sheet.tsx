"use client";

import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ASSET_CATEGORIES } from "@/config/facility-workspace";
import type { AdminServiceAsset, AssetCategory, CommunityAssetStatus } from "@/types";

interface ServiceAssetFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset?: AdminServiceAsset | null;
  onSave: (values: ServiceAssetFormValues) => void;
}

export interface ServiceAssetFormValues {
  name: string;
  assetType: AssetCategory;
  location: string;
  vendor: string;
  nextServiceDate: string;
  amcExpiryDate: string;
  serviceIntervalDays: number;
  status: CommunityAssetStatus;
  publishStatus: AdminServiceAsset["publishStatus"];
}

const emptyForm: ServiceAssetFormValues = {
  name: "",
  assetType: "other",
  location: "",
  vendor: "",
  nextServiceDate: "",
  amcExpiryDate: "",
  serviceIntervalDays: 90,
  status: "active",
  publishStatus: "draft",
};

export function ServiceAssetFormSheet({
  open,
  onOpenChange,
  asset,
  onSave,
}: ServiceAssetFormSheetProps) {
  const [form, setForm] = useState<ServiceAssetFormValues>(emptyForm);

  useEffect(() => {
    if (asset) {
      setForm({
        name: asset.name,
        assetType: asset.assetType,
        location: asset.location ?? "",
        vendor: asset.vendor,
        nextServiceDate: asset.nextServiceDate ?? "",
        amcExpiryDate: asset.amcExpiryDate ?? "",
        serviceIntervalDays: asset.serviceIntervalDays,
        status: asset.status,
        publishStatus: asset.publishStatus,
      });
    } else {
      setForm(emptyForm);
    }
  }, [asset, open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSave(form);
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
        <SheetTitle>{asset ? "Edit asset" : "Add asset"}</SheetTitle>
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <Field label="Asset name">
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Lift A"
              required
            />
          </Field>
          <Field label="Category">
            <select
              className="flex h-9 w-full rounded-lg border bg-background px-3 text-sm"
              value={form.assetType}
              onChange={(e) =>
                setForm({ ...form, assetType: e.target.value as AssetCategory })
              }
            >
              {ASSET_CATEGORIES.filter((c) => c.enabled).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Location">
            <Input
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="Block A — Lobby"
            />
          </Field>
          <Field label="Vendor">
            <Input
              value={form.vendor}
              onChange={(e) => setForm({ ...form, vendor: e.target.value })}
              placeholder="Vendor name"
            />
          </Field>
          <Field label="Next service date">
            <Input
              type="date"
              value={form.nextServiceDate}
              onChange={(e) => setForm({ ...form, nextServiceDate: e.target.value })}
            />
          </Field>
          <Field label="AMC expiry date">
            <Input
              type="date"
              value={form.amcExpiryDate}
              onChange={(e) => setForm({ ...form, amcExpiryDate: e.target.value })}
            />
          </Field>
          <Field label="Service interval (days)">
            <Input
              type="number"
              min={1}
              value={form.serviceIntervalDays}
              onChange={(e) =>
                setForm({ ...form, serviceIntervalDays: Number(e.target.value) || 90 })
              }
            />
          </Field>
          <Field label="Operational status">
            <select
              className="flex h-9 w-full rounded-lg border bg-background px-3 text-sm"
              value={form.status}
              onChange={(e) =>
                setForm({ ...form, status: e.target.value as CommunityAssetStatus })
              }
            >
              <option value="active">Active</option>
              <option value="service_due_soon">Service due soon</option>
              <option value="amc_overdue">AMC overdue</option>
              <option value="under_maintenance">Under maintenance</option>
              <option value="inactive">Inactive</option>
            </select>
          </Field>
          <Field label="Visibility">
            <select
              className="flex h-9 w-full rounded-lg border bg-background px-3 text-sm"
              value={form.publishStatus}
              onChange={(e) =>
                setForm({
                  ...form,
                  publishStatus: e.target.value as AdminServiceAsset["publishStatus"],
                })
              }
            >
              <option value="draft">Draft — admin only</option>
              <option value="published">Published — visible to inspectors</option>
            </select>
          </Field>
          <div className="flex gap-2 pt-2">
            <Button type="submit" className="flex-1">
              {asset ? "Save changes" : "Add asset"}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
