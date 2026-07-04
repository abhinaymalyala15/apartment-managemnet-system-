/**
 * Resident authentication types.
 * Swap `residentAuthApi` implementation for real backend calls in Phase 2.
 */

export interface ResidentAuthUser {
  id: string;
  username: string;
  fullName: string;
  email: string;
  mobile: string;
  apartmentId?: string;
  flatId?: string;
  flatNumber?: string;
}

export interface ResidentAuthSession {
  token: string;
  user: ResidentAuthUser;
  expiresAt: string;
}

export interface ResidentLoginCredentials {
  username: string;
  password: string;
}

export interface ResidentRegisterPayload {
  username: string;
  fullName: string;
  email: string;
  mobile: string;
  password: string;
  confirmPassword: string;
}

export interface AuthApiResult<T = void> {
  ok: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Partial<Record<string, string>>;
}

/** Reserved for future auth features — not implemented in v1 */
export type ResidentAuthFutureFeature =
  | "forgot_password"
  | "email_verification"
  | "otp_login"
  | "flat_verification"
  | "apartment_selection"
  | "multi_apartment";

export interface StoredResidentAccount extends ResidentAuthUser {
  /** Demo only — backend will store password hashes */
  password: string;
  createdAt: string;
}
