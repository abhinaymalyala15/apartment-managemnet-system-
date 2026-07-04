"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AdminServiceAsset, ServicePublishStatus } from "@/types";
import { getAdminServiceAssets } from "@/lib/admin-services-setup-data";

type AssetDraft = Omit<AdminServiceAsset, "id" | "apartmentId"> & {
  id?: string;
  apartmentId?: string;
};

interface ServicesSetupContextValue {
  assets: AdminServiceAsset[];
  assetSummary: { total: number; published: number; drafts: number; dueSoon: number };
  addAsset: (draft: AssetDraft) => void;
  updateAsset: (id: string, patch: Partial<AdminServiceAsset>) => void;
  removeAsset: (id: string) => void;
  toggleAssetPublish: (id: string) => void;
}

const ServicesSetupContext = createContext<ServicesSetupContextValue | null>(null);

function newId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}`;
}

export function ServicesSetupProvider({ children }: { children: ReactNode }) {
  const [assets, setAssets] = useState<AdminServiceAsset[]>(() => getAdminServiceAssets());

  const assetSummary = useMemo(
    () => ({
      total: assets.length,
      published: assets.filter((a) => a.publishStatus === "published").length,
      drafts: assets.filter((a) => a.publishStatus === "draft").length,
      dueSoon: assets.filter((a) => a.status === "service_due_soon").length,
    }),
    [assets]
  );

  const addAsset = useCallback((draft: AssetDraft) => {
    const asset: AdminServiceAsset = {
      id: draft.id ?? newId("asset"),
      apartmentId: draft.apartmentId ?? "apt-sylvan-shelter",
      blockId: draft.blockId,
      flatId: draft.flatId,
      name: draft.name,
      assetType: draft.assetType,
      scope: draft.scope ?? "community",
      location: draft.location,
      vendor: draft.vendor,
      vendorId: draft.vendorId,
      amcExpiryDate: draft.amcExpiryDate ?? "2025-12-31",
      amcId: draft.amcId,
      nextServiceDate: draft.nextServiceDate,
      lastServiceDate: draft.lastServiceDate,
      installationDate: draft.installationDate,
      warrantyExpiry: draft.warrantyExpiry,
      status: draft.status ?? "active",
      publishStatus: draft.publishStatus ?? "draft",
      serviceIntervalDays: draft.serviceIntervalDays ?? 90,
    };
    setAssets((prev) => [...prev, asset]);
  }, []);

  const updateAsset = useCallback((id: string, patch: Partial<AdminServiceAsset>) => {
    setAssets((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  }, []);

  const removeAsset = useCallback((id: string) => {
    setAssets((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const toggleAssetPublish = useCallback((id: string) => {
    setAssets((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              publishStatus: (a.publishStatus === "published" ? "draft" : "published") as ServicePublishStatus,
            }
          : a
      )
    );
  }, []);

  const value: ServicesSetupContextValue = {
    assets,
    assetSummary,
    addAsset,
    updateAsset,
    removeAsset,
    toggleAssetPublish,
  };

  return (
    <ServicesSetupContext.Provider value={value}>{children}</ServicesSetupContext.Provider>
  );
}

export function useServicesSetup() {
  const ctx = useContext(ServicesSetupContext);
  if (!ctx) throw new Error("useServicesSetup must be used within ServicesSetupProvider");
  return ctx;
}
