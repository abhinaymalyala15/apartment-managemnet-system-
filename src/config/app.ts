/**
 * Application-wide configuration.
 * Central source for branding, environment flags, and feature toggles.
 */

export const appConfig = {
  name: "ApartmentERP",
  tagline: "Community Management Platform",
  description:
    "A complete multi-tenant ERP platform for apartment communities across India.",
  version: "0.1.0",
  locale: "en-IN",
  currency: "INR",
  /** Demo mode — no backend, no real authentication */
  isDemoMode: true,
  /** Payment gateways are intentionally disabled */
  payments: {
    gatewayEnabled: false,
    manualRecordingOnly: true,
  },
} as const;

export type AppConfig = typeof appConfig;
