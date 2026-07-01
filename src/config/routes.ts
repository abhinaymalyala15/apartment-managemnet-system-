/**
 * Central route definitions.
 * Use these constants instead of hardcoding paths across the app.
 */

export const routes = {
  public: {
    home: "/",
    about: "/about",
    features: "/features",
    gallery: "/gallery",
    contact: "/contact",
    login: "/login",
  },
  dashboard: {
    resident: {
      root: "/resident",
    },
    inspector: {
      root: "/inspector",
    },
    admin: {
      root: "/admin",
    },
    platform: {
      root: "/platform",
    },
  },
} as const;

export type DashboardRole = keyof typeof routes.dashboard;
