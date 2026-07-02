"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type FlatOpsAction =
  | "record-payment"
  | "print-statement"
  | "download-statement"
  | "edit-owner"
  | "replace-owner"
  | "add-tenant"
  | "replace-tenant"
  | "end-tenancy"
  | "add-family"
  | "edit-family"
  | "upload-document"
  | "log-follow-up"
  | "print-receipt";

interface FlatOpsContextValue {
  flatId: string;
  flatNumber: string;
  activeAction: FlatOpsAction | null;
  openAction: (action: FlatOpsAction) => void;
  closeAction: () => void;
}

const FlatOpsContext = createContext<FlatOpsContextValue | null>(null);

export function FlatOpsProvider({
  flatId,
  flatNumber,
  children,
}: {
  flatId: string;
  flatNumber: string;
  children: ReactNode;
}) {
  const [activeAction, setActiveAction] = useState<FlatOpsAction | null>(null);

  const openAction = useCallback((action: FlatOpsAction) => {
    setActiveAction(action);
  }, []);

  const closeAction = useCallback(() => setActiveAction(null), []);

  const value = useMemo(
    () => ({ flatId, flatNumber, activeAction, openAction, closeAction }),
    [flatId, flatNumber, activeAction, openAction, closeAction]
  );

  return (
    <FlatOpsContext.Provider value={value}>{children}</FlatOpsContext.Provider>
  );
}

export function useFlatOps() {
  const ctx = useContext(FlatOpsContext);
  if (!ctx) {
    throw new Error("useFlatOps must be used within FlatOpsProvider");
  }
  return ctx;
}
