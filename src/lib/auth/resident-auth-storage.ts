import seedAccounts from "@/data/resident-auth-seed.json";
import {
  RESIDENT_ACCOUNTS_STORAGE_KEY,
  RESIDENT_SESSION_STORAGE_KEY,
} from "@/lib/auth/constants";
import type { ResidentAuthSession, StoredResidentAccount } from "@/lib/auth/types";

const seed = seedAccounts as StoredResidentAccount[];

function isBrowser() {
  return typeof window !== "undefined";
}

export function getSeedAccounts(): StoredResidentAccount[] {
  return seed.map((account) => ({ ...account }));
}

export function getRegisteredAccounts(): StoredResidentAccount[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(RESIDENT_ACCOUNTS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as StoredResidentAccount[];
  } catch {
    return [];
  }
}

export function getAllAccounts(): StoredResidentAccount[] {
  return [...getSeedAccounts(), ...getRegisteredAccounts()];
}

export function saveRegisteredAccount(account: StoredResidentAccount): void {
  if (!isBrowser()) return;
  const existing = getRegisteredAccounts();
  localStorage.setItem(
    RESIDENT_ACCOUNTS_STORAGE_KEY,
    JSON.stringify([...existing, account])
  );
}

export function isUsernameTaken(username: string): boolean {
  const normalized = username.trim().toLowerCase();
  return getAllAccounts().some((a) => a.username.toLowerCase() === normalized);
}

export function findAccountByUsername(username: string): StoredResidentAccount | undefined {
  const normalized = username.trim().toLowerCase();
  return getAllAccounts().find((a) => a.username.toLowerCase() === normalized);
}

export function readSession(): ResidentAuthSession | null {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(RESIDENT_SESSION_STORAGE_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as ResidentAuthSession;
    if (new Date(session.expiresAt).getTime() <= Date.now()) {
      localStorage.removeItem(RESIDENT_SESSION_STORAGE_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function writeSession(session: ResidentAuthSession): void {
  if (!isBrowser()) return;
  localStorage.setItem(RESIDENT_SESSION_STORAGE_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(RESIDENT_SESSION_STORAGE_KEY);
}
