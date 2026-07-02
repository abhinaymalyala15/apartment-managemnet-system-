"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type AdminQuickAction =
  | "record-payment"
  | "publish-notice"
  | "schedule-service"
  | "search-flat"
  | "log-complaint";

interface AdminActionContextValue {
  activeAction: AdminQuickAction | null;
  openAction: (action: AdminQuickAction) => void;
  closeAction: () => void;
  searchOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
}

const AdminActionContext = createContext<AdminActionContextValue | null>(null);

export function AdminActionProvider({ children }: { children: ReactNode }) {
  const [activeAction, setActiveAction] = useState<AdminQuickAction | null>(
    null
  );
  const [searchOpen, setSearchOpen] = useState(false);

  const openAction = useCallback((action: AdminQuickAction) => {
    setActiveAction(action);
    if (action === "search-flat") {
      setSearchOpen(true);
    }
  }, []);

  const closeAction = useCallback(() => setActiveAction(null), []);

  const openSearch = useCallback(() => setSearchOpen(true), []);
  const closeSearch = useCallback(() => {
    setSearchOpen(false);
    setActiveAction((current) =>
      current === "search-flat" ? null : current
    );
  }, []);

  const value = useMemo(
    () => ({
      activeAction,
      openAction,
      closeAction,
      searchOpen,
      openSearch,
      closeSearch,
    }),
    [activeAction, closeAction, closeSearch, openAction, openSearch, searchOpen]
  );

  return (
    <AdminActionContext.Provider value={value}>
      {children}
    </AdminActionContext.Provider>
  );
}

export function useAdminActions() {
  const ctx = useContext(AdminActionContext);
  if (!ctx) {
    throw new Error("useAdminActions must be used within AdminActionProvider");
  }
  return ctx;
}
