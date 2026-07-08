/**
 * Financial statement types — shared by Admin editor and portal viewers.
 * Future income statements reuse the same line/table shape via `kind`.
 */

export type FinancialStatementKind = "expense" | "income";

export type FinancialStatementStatus = "draft" | "published";

export interface FinancialStatementLine {
  id: string;
  description: string;
  /** Whole rupees; empty rows use 0 until filled. */
  amount: number;
}

export interface FinancialStatement {
  id: string;
  kind: FinancialStatementKind;
  /** Calendar month, e.g. "2026-07" */
  monthKey: string;
  monthLabel: string;
  buildingName: string;
  title: string;
  preparedBy: string;
  status: FinancialStatementStatus;
  lines: FinancialStatementLine[];
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface FinancialStatementTotals {
  entryCount: number;
  totalAmount: number;
}
