"use client";

import { useEffect, useRef } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  BillingSetupConfig,
  FlatBillingRow,
  FlatBillingStatus,
} from "@/types";
import { getDemoTodayIso } from "@/lib/billing-setup-data";
import {
  loadBillingSetup,
  saveBillingSetup,
} from "@/lib/admin-local-storage";
import { buildFlatBillingRowsFromConfig } from "@/lib/billing-setup-data";

interface BillingSetupContextValue {
  config: BillingSetupConfig;
  rows: FlatBillingRow[];
  summary: {
    flatCount: number;
    pendingCount: number;
    paidCount: number;
  };
  otherColumnLabel: string;
  billingPeriod: string;
  ratePerSqft: number;
  setOtherColumnLabel: (label: string) => void;
  setBillingPeriod: (period: string) => void;
  setRatePerSqft: (rate: number) => void;
  setMaintenanceAmount: (flatId: string, amount: number) => void;
  setOtherAmount: (flatId: string, amount: number) => void;
  applyRateToAllFlats: () => void;
  applyOtherToAllFlats: (amount: number) => void;
  markMaintenancePaid: (flatId: string) => void;
  restorePending: (flatId: string) => void;
}

const BillingSetupContext = createContext<BillingSetupContextValue | null>(null);

interface BillingSetupProviderProps {
  initialConfig: BillingSetupConfig;
  initialRows: FlatBillingRow[];
  children: ReactNode;
}

export function BillingSetupProvider({
  initialConfig,
  initialRows,
  children,
}: BillingSetupProviderProps) {
  const [otherColumnLabel, setOtherColumnLabelState] = useState(
    initialConfig.otherColumnLabel
  );
  const [billingPeriod, setBillingPeriodState] = useState(initialConfig.billingPeriod);
  const [ratePerSqft, setRatePerSqftState] = useState(initialConfig.ratePerSqft);
  const [rows, setRows] = useState<FlatBillingRow[]>(initialRows);
  const hydrated = useRef(false);

  useEffect(() => {
    const stored = loadBillingSetup();
    if (stored) {
      setOtherColumnLabelState(stored.otherColumnLabel);
      setBillingPeriodState(stored.billingPeriod);
      setRatePerSqftState(stored.ratePerSqft);
      setRows(buildFlatBillingRowsFromConfig(stored));
    }
    hydrated.current = true;
  }, []);

  const recomputeRow = useCallback(
    (row: FlatBillingRow, patch: Partial<FlatBillingRow>): FlatBillingRow => {
      const next = { ...row, ...patch };
      next.totalDue =
        next.maintenanceStatus === "paid"
          ? next.otherAmount
          : next.maintenanceAmount + next.otherAmount;
      return next;
    },
    []
  );

  const setMaintenanceAmount = useCallback(
    (flatId: string, amount: number) => {
      setRows((prev) =>
        prev.map((row) =>
          row.flatId === flatId
            ? recomputeRow(row, { maintenanceAmount: Math.max(0, amount) })
            : row
        )
      );
    },
    [recomputeRow]
  );

  const setOtherAmount = useCallback(
    (flatId: string, amount: number) => {
      setRows((prev) =>
        prev.map((row) =>
          row.flatId === flatId
            ? recomputeRow(row, { otherAmount: Math.max(0, amount) })
            : row
        )
      );
    },
    [recomputeRow]
  );

  const applyRateToAllFlats = useCallback(() => {
    setRows((prev) =>
      prev.map((row) =>
        recomputeRow(row, {
          maintenanceAmount: Math.round(ratePerSqft * row.areaSqft),
        })
      )
    );
  }, [ratePerSqft, recomputeRow]);

  const applyOtherToAllFlats = useCallback(
    (amount: number) => {
      const value = Math.max(0, amount);
      setRows((prev) =>
        prev.map((row) => recomputeRow(row, { otherAmount: value }))
      );
    },
    [recomputeRow]
  );

  const markMaintenancePaid = useCallback(
    (flatId: string) => {
      setRows((prev) =>
        prev.map((row) =>
          row.flatId === flatId
            ? recomputeRow(row, {
                maintenanceStatus: "paid" as FlatBillingStatus,
                manuallyClearedAt: getDemoTodayIso(),
              })
            : row
        )
      );
    },
    [recomputeRow]
  );

  const restorePending = useCallback(
    (flatId: string) => {
      setRows((prev) =>
        prev.map((row) =>
          row.flatId === flatId
            ? recomputeRow(row, {
                maintenanceStatus: "pending" as FlatBillingStatus,
                manuallyClearedAt: undefined,
              })
            : row
        )
      );
    },
    [recomputeRow]
  );

  const summary = useMemo(() => {
    const pendingCount = rows.filter((r) => r.maintenanceStatus !== "paid").length;
    return {
      flatCount: rows.length,
      pendingCount,
      paidCount: rows.length - pendingCount,
    };
  }, [rows]);

  const config: BillingSetupConfig = useMemo(
    () => ({
      otherColumnLabel,
      billingPeriod,
      ratePerSqft,
      assignments: rows.map(
        ({ flatId, maintenanceAmount, otherAmount, maintenanceStatus, manuallyClearedAt }) => ({
          flatId,
          maintenanceAmount,
          otherAmount,
          maintenanceStatus,
          manuallyClearedAt,
        })
      ),
    }),
    [otherColumnLabel, billingPeriod, ratePerSqft, rows]
  );

  useEffect(() => {
    if (!hydrated.current) return;
    saveBillingSetup(config);
  }, [config]);

  const value: BillingSetupContextValue = {
    config,
    rows,
    summary,
    otherColumnLabel,
    billingPeriod,
    ratePerSqft,
    setOtherColumnLabel: setOtherColumnLabelState,
    setBillingPeriod: setBillingPeriodState,
    setRatePerSqft: setRatePerSqftState,
    setMaintenanceAmount,
    setOtherAmount,
    applyRateToAllFlats,
    applyOtherToAllFlats,
    markMaintenancePaid,
    restorePending,
  };

  return (
    <BillingSetupContext.Provider value={value}>{children}</BillingSetupContext.Provider>
  );
}

export function useBillingSetup() {
  const ctx = useContext(BillingSetupContext);
  if (!ctx) {
    throw new Error("useBillingSetup must be used within BillingSetupProvider");
  }
  return ctx;
}
