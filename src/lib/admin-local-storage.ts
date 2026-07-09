/**
 * Client-side persistence for Admin configuration (demo mode).
 * Same pattern as financial-statement-data.ts — survives page refresh.
 */

import type { AdminServiceAsset, BillingSetupConfig } from "@/types";

const BILLING_KEY = "apartmenterp.admin.billing-setup.v1";
const SERVICES_KEY = "apartmenterp.admin.services-registry.v1";

function readJson<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeJson<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function loadBillingSetup(): BillingSetupConfig | null {
  return readJson<BillingSetupConfig>(BILLING_KEY);
}

export function saveBillingSetup(config: BillingSetupConfig): void {
  writeJson(BILLING_KEY, config);
}

export function clearBillingSetup(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(BILLING_KEY);
}

export function loadServicesRegistry(): AdminServiceAsset[] | null {
  return readJson<AdminServiceAsset[]>(SERVICES_KEY);
}

export function saveServicesRegistry(assets: AdminServiceAsset[]): void {
  writeJson(SERVICES_KEY, assets);
}

export function clearServicesRegistry(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SERVICES_KEY);
}
