"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type CommunicationAction =
  | "compose"
  | "edit-draft"
  | "publish"
  | "schedule"
  | "archive"
  | "emergency";

export interface CommunicationActionContext {
  noticeId?: string;
  draftId?: string;
  title?: string;
}

interface CommunicationContextValue {
  activeAction: CommunicationAction | null;
  actionContext: CommunicationActionContext;
  openAction: (
    action: CommunicationAction,
    context?: CommunicationActionContext
  ) => void;
  closeAction: () => void;
}

const CommunicationContext = createContext<CommunicationContextValue | null>(
  null
);

export function CommunicationProvider({ children }: { children: ReactNode }) {
  const [activeAction, setActiveAction] = useState<CommunicationAction | null>(
    null
  );
  const [actionContext, setActionContext] =
    useState<CommunicationActionContext>({});

  const openAction = useCallback(
    (action: CommunicationAction, context: CommunicationActionContext = {}) => {
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
    <CommunicationContext.Provider value={value}>
      {children}
    </CommunicationContext.Provider>
  );
}

export function useCommunicationActions() {
  const ctx = useContext(CommunicationContext);
  if (!ctx) {
    throw new Error(
      "useCommunicationActions must be used within CommunicationProvider"
    );
  }
  return ctx;
}
