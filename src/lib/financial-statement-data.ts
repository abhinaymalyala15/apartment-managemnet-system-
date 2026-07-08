import type {
  FinancialStatement,
  FinancialStatementKind,
  FinancialStatementLine,
  FinancialStatementTotals,
} from "@/types/financial-statement";

export function createLineId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `line-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createEmptyLine(): FinancialStatementLine {
  return { id: createLineId(), description: "", amount: 0 };
}

export function sumStatementLines(
  lines: FinancialStatementLine[]
): FinancialStatementTotals {
  const totalAmount = lines.reduce((sum, line) => sum + (Number(line.amount) || 0), 0);
  const entryCount = lines.filter(
    (line) => line.description.trim().length > 0 || (Number(line.amount) || 0) > 0
  ).length;
  return { entryCount, totalAmount };
}

export function statementKindLabel(kind: FinancialStatementKind): string {
  return kind === "income" ? "Monthly Income Statement" : "Monthly Expense Statement";
}

export function formatMonthKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export function formatMonthLabel(monthKey: string): string {
  const [y, m] = monthKey.split("-").map(Number);
  if (!y || !m) return monthKey;
  return new Intl.DateTimeFormat("en-IN", {
    month: "long",
    year: "numeric",
  }).format(new Date(y, m - 1, 1));
}

export function createDraftExpenseStatement(input: {
  buildingName: string;
  preparedBy?: string;
  monthKey?: string;
}): FinancialStatement {
  const monthKey = input.monthKey ?? formatMonthKey(new Date(2026, 6, 1));
  const now = new Date().toISOString();
  return {
    id: `fs-${monthKey}-expense`,
    kind: "expense",
    monthKey,
    monthLabel: formatMonthLabel(monthKey),
    buildingName: input.buildingName,
    title: statementKindLabel("expense"),
    preparedBy: input.preparedBy ?? "Apartment Administrator",
    status: "draft",
    lines: defaultExpenseSeed(),
    createdAt: now,
    updatedAt: now,
  };
}

/** Seed rows matching the product brief sample sheet. */
export function defaultExpenseSeed(): FinancialStatementLine[] {
  const samples: Array<[string, number]> = [
    ["Security Salary", 30000],
    ["Electricity Bill", 12500],
    ["Lift AMC", 5000],
    ["Water Supply", 6000],
    ["Garden Maintenance", 3500],
    ["Drainage Cleaning", 2000],
  ];
  return samples.map(([description, amount]) => ({
    id: createLineId(),
    description,
    amount,
  }));
}

const STORAGE_KEY = "apartmenterp.financial-statements.v1";

function readStore(): FinancialStatement[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as FinancialStatement[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStore(statements: FinancialStatement[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(statements));
}

export function listFinancialStatements(): FinancialStatement[] {
  return readStore().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function listPublishedFinancialStatements(): FinancialStatement[] {
  return listFinancialStatements().filter((s) => s.status === "published");
}

export function getFinancialStatement(id: string): FinancialStatement | undefined {
  return readStore().find((s) => s.id === id);
}

export function upsertFinancialStatement(
  statement: FinancialStatement
): FinancialStatement {
  const all = readStore();
  const idx = all.findIndex((s) => s.id === statement.id);
  const next = { ...statement, updatedAt: new Date().toISOString() };
  if (idx >= 0) all[idx] = next;
  else all.unshift(next);
  writeStore(all);
  return next;
}

export function publishFinancialStatement(
  statement: FinancialStatement
): FinancialStatement {
  const published: FinancialStatement = {
    ...statement,
    status: "published",
    publishedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  return upsertFinancialStatement(published);
}
