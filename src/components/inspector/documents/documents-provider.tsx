"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type DocumentsAction = "upload-society" | "upload-flat" | "upload-asset";

export interface DocumentsActionContext {
  flatId?: string;
  assetId?: string;
}

interface DocumentsContextValue {
  activeAction: DocumentsAction | null;
  actionContext: DocumentsActionContext;
  openAction: (action: DocumentsAction, context?: DocumentsActionContext) => void;
  closeAction: () => void;
}

const DocumentsContext = createContext<DocumentsContextValue | null>(null);

export function DocumentsProvider({ children }: { children: ReactNode }) {
  const [activeAction, setActiveAction] = useState<DocumentsAction | null>(null);
  const [actionContext, setActionContext] = useState<DocumentsActionContext>({});

  const openAction = useCallback(
    (action: DocumentsAction, context: DocumentsActionContext = {}) => {
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
    <DocumentsContext.Provider value={value}>{children}</DocumentsContext.Provider>
  );
}

export function useDocumentsActions() {
  const ctx = useContext(DocumentsContext);
  if (!ctx) {
    throw new Error("useDocumentsActions must be used within DocumentsProvider");
  }
  return ctx;
}
