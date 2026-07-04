"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { AuthField, AuthFormActions } from "@/components/auth/auth-field";
import { AuthLayout } from "@/components/auth/auth-layout";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { useResidentAuth } from "@/contexts/resident-auth-context";
import { RESIDENT_REGISTER_SUCCESS_REDIRECT_MS } from "@/lib/auth/constants";
import { routes } from "@/config/routes";

export function ResidentRegisterForm() {
  const router = useRouter();
  const { register } = useResidentAuth();

  const [form, setForm] = useState({
    username: "",
    fullName: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
  });
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof typeof form, string>>
  >({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  function updateField<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (fieldErrors[key]) {
      setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});
    setIsSubmitting(true);

    const result = await register(form);
    setIsSubmitting(false);

    if (!result.ok) {
      if (result.fieldErrors) {
        setFieldErrors(result.fieldErrors);
      } else {
        setFormError(result.error ?? "Registration failed. Please try again.");
      }
      return;
    }

    setIsSuccess(true);
    window.setTimeout(() => {
      router.replace(`${routes.auth.resident.login}?registered=1`);
    }, RESIDENT_REGISTER_SUCCESS_REDIRECT_MS);
  }

  if (isSuccess) {
    return (
      <AuthLayout title="Account created" subtitle="You're almost ready to go.">
        <div className="space-y-4 text-center">
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200">
            Account created successfully. You can now log in.
          </div>
          <p className="text-sm text-muted-foreground">
            Redirecting to login in a few seconds…
          </p>
          <ButtonLink
            href={`${routes.auth.resident.login}?registered=1`}
            className="w-full"
          >
            Go to login
          </ButtonLink>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Create account" subtitle="Register for resident portal access">
      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthField
          id="username"
          label="Username"
          value={form.username}
          onChange={(v) => updateField("username", v)}
          error={fieldErrors.username}
          autoComplete="username"
          disabled={isSubmitting}
        />
        <AuthField
          id="fullName"
          label="Full name"
          value={form.fullName}
          onChange={(v) => updateField("fullName", v)}
          error={fieldErrors.fullName}
          autoComplete="name"
          disabled={isSubmitting}
        />
        <AuthField
          id="email"
          label="Email address"
          type="email"
          value={form.email}
          onChange={(v) => updateField("email", v)}
          error={fieldErrors.email}
          autoComplete="email"
          disabled={isSubmitting}
        />
        <AuthField
          id="mobile"
          label="Mobile number"
          type="tel"
          value={form.mobile}
          onChange={(v) => updateField("mobile", v)}
          error={fieldErrors.mobile}
          autoComplete="tel"
          disabled={isSubmitting}
        />
        <AuthField
          id="password"
          label="Create password"
          type="password"
          value={form.password}
          onChange={(v) => updateField("password", v)}
          error={fieldErrors.password}
          autoComplete="new-password"
          disabled={isSubmitting}
        />
        <AuthField
          id="confirmPassword"
          label="Confirm password"
          type="password"
          value={form.confirmPassword}
          onChange={(v) => updateField("confirmPassword", v)}
          error={fieldErrors.confirmPassword}
          autoComplete="new-password"
          disabled={isSubmitting}
        />

        {formError && (
          <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {formError}
          </p>
        )}

        <AuthFormActions>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account…
              </>
            ) : (
              "Create account"
            )}
          </Button>
          <ButtonLink href={routes.auth.resident.login} variant="outline" className="w-full">
            Back to login
          </ButtonLink>
        </AuthFormActions>
      </form>
    </AuthLayout>
  );
}
