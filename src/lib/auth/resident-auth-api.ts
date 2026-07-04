/**
 * Mock resident auth API.
 * Replace method bodies with fetch() calls to `/api/v1/auth/*` when backend is ready.
 */

import {
  clearSession,
  findAccountByUsername,
  isUsernameTaken,
  readSession,
  saveRegisteredAccount,
  writeSession,
} from "@/lib/auth/resident-auth-storage";
import { validateLogin, validateRegister } from "@/lib/auth/validate-resident-auth";
import type {
  AuthApiResult,
  ResidentAuthSession,
  ResidentAuthUser,
  ResidentLoginCredentials,
  ResidentRegisterPayload,
  StoredResidentAccount,
} from "@/lib/auth/types";

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function toAuthUser(account: StoredResidentAccount): ResidentAuthUser {
  const { password: _password, createdAt: _createdAt, ...user } = account;
  return user;
}

function createSession(user: ResidentAuthUser): ResidentAuthSession {
  return {
    token: `demo-${user.id}-${Date.now()}`,
    user,
    expiresAt: new Date(Date.now() + SESSION_TTL_MS).toISOString(),
  };
}

function delay(ms = 350): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const residentAuthApi = {
  async getSession(): Promise<ResidentAuthSession | null> {
    await delay(80);
    return readSession();
  },

  async login(credentials: ResidentLoginCredentials): Promise<AuthApiResult<ResidentAuthSession>> {
    await delay();

    const { valid, errors } = validateLogin(credentials);
    if (!valid) {
      return { ok: false, fieldErrors: errors };
    }

    const account = findAccountByUsername(credentials.username);
    if (!account || account.password !== credentials.password) {
      return {
        ok: false,
        error: "Invalid username or password",
      };
    }

    const session = createSession(toAuthUser(account));
    writeSession(session);
    return { ok: true, data: session };
  },

  async register(payload: ResidentRegisterPayload): Promise<AuthApiResult<ResidentAuthUser>> {
    await delay();

    const usernameTaken = isUsernameTaken(payload.username);
    const { valid, errors } = validateRegister(payload, { usernameTaken });
    if (!valid) {
      return { ok: false, fieldErrors: errors };
    }

    const account: StoredResidentAccount = {
      id: `resident-${Date.now().toString(36)}`,
      username: payload.username.trim(),
      fullName: payload.fullName.trim(),
      email: payload.email.trim(),
      mobile: payload.mobile.trim(),
      password: payload.password,
      apartmentId: "apt-sylvan-shelter",
      createdAt: new Date().toISOString(),
    };

    saveRegisteredAccount(account);
    return { ok: true, data: toAuthUser(account) };
  },

  async logout(): Promise<void> {
    await delay(80);
    clearSession();
  },
};
