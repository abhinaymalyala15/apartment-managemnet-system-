"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type FinanceAction =
  | "record-payment"
  | "log-follow-up"
  | "generate-receipt"
  | "generate-statement"
  | "print-receipt"
  | "download-receipt";

export interface FinanceActionContext {
  flatId?: string;
  flatNumber?: string;
  paymentId?: string;
  receiptNumber?: string;
}

interface FinanceContextValue {
  activeAction: FinanceAction | null;
  actionContext: FinanceActionContext;
  openAction: (action: FinanceAction, context?: FinanceActionContext) => void;
  closeAction: () => void;
}

const FinanceContext = createContext<FinanceContextValue | null>(null);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [activeAction, setActiveAction] = useState<FinanceAction | null>(null);
  const [actionContext, setActionContext] = useState<FinanceActionContext>({});

  const openAction = useCallback(
    (action: FinanceAction, context: FinanceActionContext = {}) => {
      setActionContext(context);
      setActiveAction(action);
    },
    []
  );

  const closeAction = useCallback(() => {
    setActiveAction(null);
    setActionContext({});
  }, []);

  const value = useMemo(
    () => ({ activeAction, actionContext, openAction, closeAction }),
    [activeAction, actionContext, openAction, closeAction]
  );

  return (
    <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>
  );
}

export function useFinanceActions() {
  const ctx = useContext(FinanceContext);
  if (!ctx) {
    throw new Error("useFinanceActions must be used within FinanceProvider");
  }
  return ctx;
}
