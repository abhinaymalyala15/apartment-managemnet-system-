"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type SettingsAction =
  | "edit-profile"
  | "update-maintenance-rate"
  | "add-committee"
  | "add-emergency"
  | "add-staff"
  | "edit-preferences";

export interface SettingsActionContext {
  memberId?: string;
  staffId?: string;
}

interface SettingsContextValue {
  activeAction: SettingsAction | null;
  actionContext: SettingsActionContext;
  openAction: (action: SettingsAction, context?: SettingsActionContext) => void;
  closeAction: () => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [activeAction, setActiveAction] = useState<SettingsAction | null>(null);
  const [actionContext, setActionContext] = useState<SettingsActionContext>({});

  const openAction = useCallback(
    (action: SettingsAction, context: SettingsActionContext = {}) => {
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
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  );
}

export function useSettingsActions() {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error("useSettingsActions must be used within SettingsProvider");
  }
  return ctx;
}
