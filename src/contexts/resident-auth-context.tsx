"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { residentAuthApi } from "@/lib/auth/resident-auth-api";
import type {
  AuthApiResult,
  ResidentAuthSession,
  ResidentAuthUser,
  ResidentLoginCredentials,
  ResidentRegisterPayload,
} from "@/lib/auth/types";

interface ResidentAuthContextValue {
  session: ResidentAuthSession | null;
  user: ResidentAuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: ResidentLoginCredentials) => Promise<AuthApiResult<ResidentAuthSession>>;
  register: (payload: ResidentRegisterPayload) => Promise<AuthApiResult<ResidentAuthUser>>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const ResidentAuthContext = createContext<ResidentAuthContextValue | null>(null);

export function ResidentAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<ResidentAuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    const current = await residentAuthApi.getSession();
    setSession(current);
  }, []);

  useEffect(() => {
    refreshSession().finally(() => setIsLoading(false));
  }, [refreshSession]);

  const login = useCallback(async (credentials: ResidentLoginCredentials) => {
    const result = await residentAuthApi.login(credentials);
    if (result.ok && result.data) setSession(result.data);
    return result;
  }, []);

  const register = useCallback(async (payload: ResidentRegisterPayload) => {
    return residentAuthApi.register(payload);
  }, []);

  const logout = useCallback(async () => {
    await residentAuthApi.logout();
    setSession(null);
  }, []);

  const value = useMemo<ResidentAuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      isLoading,
      isAuthenticated: Boolean(session),
      login,
      register,
      logout,
      refreshSession,
    }),
    [session, isLoading, login, register, logout, refreshSession]
  );

  return (
    <ResidentAuthContext.Provider value={value}>{children}</ResidentAuthContext.Provider>
  );
}

export function useResidentAuth() {
  const ctx = useContext(ResidentAuthContext);
  if (!ctx) {
    throw new Error("useResidentAuth must be used within ResidentAuthProvider");
  }
  return ctx;
}
