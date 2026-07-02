/**
 * Accounting workspace registry — Finance module evolution path.
 * Enable modules by setting `enabled: true` in future phases.
 */

export type AccountingCollectionType =
  | "maintenance"
  | "corpus_fund"
  | "sinking_fund"
  | "special_assessment"
  | "parking"
  | "clubhouse"
  | "facility_booking"
  | "penalty"
  | "interest"
  | "refund";

export type AccountingExpenseType =
  | "vendor_payment"
  | "bank_deposit"
  | "cash_book"
  | "income_expense"
  | "annual_summary";

export interface AccountingModuleDef {
  id: string;
  label: string;
  href?: string;
  enabled: boolean;
  phase?: string;
  description: string;
}

/** Nav tabs for /admin/maintenance */
export const ACCOUNTING_NAV_MODULES: AccountingModuleDef[] = [
  {
    id: "outstanding",
    label: "Outstanding",
    href: "/inspector/maintenance/outstanding",
    enabled: true,
    description: "Prioritized collection queue",
  },
  {
    id: "payments",
    label: "Payments",
    href: "/inspector/maintenance/payments",
    enabled: true,
    description: "Recorded payments by period",
  },
  {
    id: "funds",
    label: "Funds",
    enabled: false,
    phase: "Future",
    description: "Corpus fund, sinking fund, special assessments",
  },
];

export const COLLECTION_TYPE_LABELS: Record<AccountingCollectionType, string> = {
  maintenance: "Maintenance",
  corpus_fund: "Corpus fund",
  sinking_fund: "Sinking fund",
  special_assessment: "Special assessment",
  parking: "Parking charges",
  clubhouse: "Clubhouse charges",
  facility_booking: "Facility booking",
  penalty: "Penalty",
  interest: "Interest",
  refund: "Refund",
};

/** Priority tiers for outstanding queue (documented order) */
export const OUTSTANDING_PRIORITY_ORDER = [
  "escalated",
  "broken_promise",
  "high_amount",
  "long_overdue",
  "recent_due",
] as const;

export type OutstandingPriorityTier = (typeof OUTSTANDING_PRIORITY_ORDER)[number];
