"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type FacilityAction =
  | "schedule-service"
  | "complete-service"
  | "renew-amc"
  | "upload-document"
  | "add-note";

export interface FacilityActionContext {
  assetId?: string;
  assetName?: string;
  serviceId?: string;
}

interface FacilityContextValue {
  activeAction: FacilityAction | null;
  actionContext: FacilityActionContext;
  openAction: (action: FacilityAction, context?: FacilityActionContext) => void;
  closeAction: () => void;
}

const FacilityContext = createContext<FacilityContextValue | null>(null);

export function FacilityProvider({ children }: { children: ReactNode }) {
  const [activeAction, setActiveAction] = useState<FacilityAction | null>(null);
  const [actionContext, setActionContext] = useState<FacilityActionContext>({});

  const openAction = useCallback(
    (action: FacilityAction, context: FacilityActionContext = {}) => {
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
    <FacilityContext.Provider value={value}>{children}</FacilityContext.Provider>
  );
}

export function useFacilityActions() {
  const ctx = useContext(FacilityContext);
  if (!ctx) {
    throw new Error("useFacilityActions must be used within FacilityProvider");
  }
  return ctx;
}
