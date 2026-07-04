import type {
  ResidentLoginCredentials,
  ResidentRegisterPayload,
} from "@/lib/auth/types";

export type LoginFieldErrors = Partial<Record<keyof ResidentLoginCredentials, string>>;
export type RegisterFieldErrors = Partial<Record<keyof ResidentRegisterPayload, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateLogin(values: ResidentLoginCredentials): {
  valid: boolean;
  errors: LoginFieldErrors;
} {
  const errors: LoginFieldErrors = {};

  if (!values.username.trim()) {
    errors.username = "Username is required";
  }

  if (!values.password) {
    errors.password = "Password is required";
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateRegister(
  values: ResidentRegisterPayload,
  options?: { usernameTaken?: boolean }
): { valid: boolean; errors: RegisterFieldErrors } {
  const errors: RegisterFieldErrors = {};

  const username = values.username.trim();
  if (!username) {
    errors.username = "Username is required";
  } else if (options?.usernameTaken) {
    errors.username = "Username is already taken";
  }

  if (!values.fullName.trim()) {
    errors.fullName = "Full name is required";
  }

  if (!values.email.trim()) {
    errors.email = "Email is required";
  } else if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = "Enter a valid email address";
  }

  if (!values.mobile.trim()) {
    errors.mobile = "Mobile number is required";
  }

  if (!values.password) {
    errors.password = "Password is required";
  } else if (values.password.length < 6) {
    errors.password = "Password must be at least 6 characters";
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = "Confirm your password";
  } else if (values.password !== values.confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  return { valid: Object.keys(errors).length === 0, errors };
}
