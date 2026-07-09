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
  noticesVersion: number;
  openAction: (
    action: CommunicationAction,
    context?: CommunicationActionContext
  ) => void;
  closeAction: () => void;
  refreshNotices: () => void;
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
  const [noticesVersion, setNoticesVersion] = useState(0);

  const refreshNotices = useCallback(() => {
    setNoticesVersion((v) => v + 1);
  }, []);

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
    () => ({
      activeAction,
      actionContext,
      noticesVersion,
      openAction,
      closeAction,
      refreshNotices,
    }),
    [activeAction, actionContext, noticesVersion, openAction, closeAction, refreshNotices]
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
