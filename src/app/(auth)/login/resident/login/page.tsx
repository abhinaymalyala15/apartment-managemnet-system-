import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { ResidentLoginForm } from "@/components/auth/resident/resident-login-form";
import { ResidentAuthProvider } from "@/contexts/resident-auth-context";

function LoginFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );
}

export default function ResidentLoginPage() {
  return (
    <ResidentAuthProvider>
      <Suspense fallback={<LoginFallback />}>
        <ResidentLoginForm />
      </Suspense>
    </ResidentAuthProvider>
  );
}
