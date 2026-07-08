"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { AuthField, AuthFormActions } from "@/components/auth/auth-field";
import { AuthLayout } from "@/components/auth/auth-layout";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { useResidentAuth } from "@/contexts/resident-auth-context";
import { routes } from "@/config/routes";

interface ResidentLoginFormProps {
  registered?: boolean;
}

export function ResidentLoginForm({ registered = false }: ResidentLoginFormProps) {
  const router = useRouter();
  const { login, isAuthenticated, isLoading } = useResidentAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ username?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(routes.dashboard.resident.root);
    }
  }, [isAuthenticated, isLoading, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});
    setIsSubmitting(true);

    const result = await login({ username, password });
    setIsSubmitting(false);

    if (!result.ok) {
      if (result.fieldErrors) {
        setFieldErrors(result.fieldErrors);
      } else {
        setFormError(result.error ?? "Login failed. Please try again.");
      }
      return;
    }

    router.replace(routes.dashboard.resident.root);
  }

  return (
    <AuthLayout title="Login" subtitle="Sign in to your resident account">
      {registered && (
        <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800">
          Account created successfully. You can now log in.
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <AuthField
            id="username"
            label="Username"
            value={username}
            onChange={setUsername}
            error={fieldErrors.username}
            autoComplete="username"
            disabled={isSubmitting}
          />
          <AuthField
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            error={fieldErrors.password}
            autoComplete="current-password"
            disabled={isSubmitting}
          />

          {formError && (
            <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {formError}
            </p>
          )}

          <AuthFormActions>
            <Button type="submit" className="h-10 w-full rounded-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                "Login"
              )}
            </Button>
            <ButtonLink
              href={routes.auth.resident.register}
              variant="outline"
              className="h-10 w-full rounded-full"
            >
              Create account
            </ButtonLink>
          </AuthFormActions>
        </form>
      )}

      {!isLoading && (
        <>
          <p className="mt-6 rounded-xl border border-slate-200/80 bg-[#f8fafc] px-3 py-2.5 text-center text-xs text-slate-500">
            Demo · <span className="font-semibold text-slate-700">srinivas</span> /{" "}
            <span className="font-semibold text-slate-700">demo123</span>
          </p>

          <p className="mt-4 text-center text-sm text-slate-500">
            <Link href={routes.auth.resident.entry} className="font-medium text-primary hover:underline">
              ← Back
            </Link>
          </p>
        </>
      )}
    </AuthLayout>
  );
}
