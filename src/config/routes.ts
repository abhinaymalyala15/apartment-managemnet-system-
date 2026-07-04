/**
 * Central route definitions.
 * Use these constants instead of hardcoding paths across the app.
 *
 * - inspector: Apartment operational portal (day-to-day society operations)
 * - admin: Apartment configuration portal (master data & billing setup)
 * - resident: Resident self-service portal
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
  auth: {
    resident: {
      entry: "/login/resident",
      login: "/login/resident/login",
      register: "/login/resident/register",
    },
  },
  dashboard: {
    resident: {
      root: "/resident",
    },
    inspector: {
      root: "/inspector",
      residents: "/inspector/residents",
      resident: (flatId: string) => `/inspector/residents/${flatId}` as const,
      flats: {
        root: "/inspector/flats",
        detail: (flatId: string) => `/inspector/flats/${flatId}` as const,
      },
      maintenance: {
        root: "/inspector/maintenance",
        outstanding: "/inspector/maintenance/outstanding",
        payments: "/inspector/maintenance/payments",
        receipts: "/inspector/maintenance/receipts",
        statements: "/inspector/maintenance/statements",
      },
      complaints: {
        root: "/inspector/complaints",
        open: "/inspector/complaints/open",
        inProgress: "/inspector/complaints/in-progress",
        resolved: "/inspector/complaints/resolved",
        detail: (id: string) => `/inspector/complaints/${id}` as const,
      },
      visitors: {
        root: "/inspector/visitors",
        pending: "/inspector/visitors/pending",
        today: "/inspector/visitors/today",
        log: "/inspector/visitors/log",
        detail: (id: string) => `/inspector/visitors/${id}` as const,
      },
      notices: {
        root: "/inspector/notices",
        published: "/inspector/notices/published",
        drafts: "/inspector/notices/drafts",
        scheduled: "/inspector/notices/scheduled",
        archived: "/inspector/notices/archived",
        detail: (id: string) => `/inspector/notices/${id}` as const,
      },
      services: {
        root: "/inspector/services",
        schedule: "/inspector/services/schedule",
        staff: "/inspector/services/staff",
        vendors: "/inspector/services/vendors",
        assets: "/inspector/services/assets",
        asset: (assetId: string) => `/inspector/services/assets/${assetId}` as const,
      },
      reports: {
        root: "/inspector/reports",
        collection: "/inspector/reports/collection",
        financial: "/inspector/reports/financial",
        occupancy: "/inspector/reports/occupancy",
        maintenance: "/inspector/reports/maintenance",
        communication: "/inspector/reports/communication",
        assets: "/inspector/reports/assets",
        movement: "/inspector/reports/movement",
      },
      settings: {
        root: "/inspector/settings",
        profile: "/inspector/settings/profile",
        structure: "/inspector/settings/structure",
        billing: "/inspector/settings/maintenance",
        committee: "/inspector/settings/committee",
        contacts: "/inspector/settings/contacts",
        team: "/inspector/settings/team",
        preferences: "/inspector/settings/preferences",
        documents: {
          root: "/inspector/settings/documents",
          society: "/inspector/settings/documents/society",
          flats: "/inspector/settings/documents/flats",
          assets: "/inspector/settings/documents/assets",
        },
      },
      /** @deprecated use maintenance — redirects remain for old links */
      finance: {
        root: "/inspector/maintenance/outstanding",
        outstanding: "/inspector/maintenance/outstanding",
        payments: "/inspector/maintenance/payments",
        receipts: "/inspector/maintenance/receipts",
        statements: "/inspector/maintenance/statements",
        reports: "/inspector/reports/financial",
        block: (blockId: string) => `/inspector/maintenance/outstanding?block=${blockId}` as const,
      },
      /** @deprecated use notices */
      communication: {
        root: "/inspector/notices/published",
        drafts: "/inspector/notices/drafts",
        scheduled: "/inspector/notices/scheduled",
        archived: "/inspector/notices/archived",
        history: "/inspector/notices/published",
      },
      /** @deprecated use services */
      assets: {
        root: "/inspector/services/assets",
        catalog: "/inspector/services/assets",
        services: "/inspector/services/schedule",
        amc: "/inspector/services/assets",
        vendors: "/inspector/services/vendors",
        detail: (assetId: string) => `/inspector/services/assets/${assetId}` as const,
      },
      documents: {
        root: "/inspector/settings/documents",
        society: "/inspector/settings/documents/society",
        flats: "/inspector/settings/documents/flats",
        assets: "/inspector/settings/documents/assets",
      },
    },
    admin: {
      root: "/admin",
      apartment: {
        root: "/admin/apartment",
        profile: "/admin/apartment/profile",
        committee: "/admin/apartment/committee",
        contacts: "/admin/apartment/contacts",
        bank: "/admin/apartment/bank",
      },
      blocks: {
        root: "/admin/blocks",
        detail: (blockId: string) => `/admin/blocks/${blockId}` as const,
        floor: (blockId: string, floor: number) =>
          `/admin/blocks/${blockId}/floors/${floor}` as const,
      },
      flats: {
        root: "/admin/flats",
        detail: (flatId: string) => `/admin/flats/${flatId}` as const,
      },
      residents: "/admin/residents",
      billing: {
        root: "/admin/billing",
        flats: "/admin/billing/flats",
        rules: "/admin/billing/rules",
        maintenance: "/admin/billing/flats",
        corpus: "/admin/billing/flats",
        water: "/admin/billing/flats",
        lift: "/admin/billing/flats",
        special: "/admin/billing/flats",
        penalty: "/admin/billing/rules",
      },
      services: {
        root: "/admin/services",
        assets: "/admin/services/assets",
        vendors: "/admin/services/vendors",
        amc: "/admin/services/amc",
        frequency: "/admin/services/frequency",
      },
      users: {
        root: "/admin/users",
        inspectors: "/admin/users/inspectors",
        staff: "/admin/users/staff",
        security: "/admin/users/security",
        committee: "/admin/users/committee",
        residents: "/admin/users/residents",
        roles: "/admin/users/roles",
      },
      documents: "/admin/documents",
      settings: "/admin/settings",
    },
    /** @deprecated use admin — /platform redirects to /admin */
    platform: {
      root: "/admin",
    },
  },
} as const;

export type DashboardRole = keyof typeof routes.dashboard;
