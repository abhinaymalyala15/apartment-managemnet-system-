import { ResidentRegisterForm } from "@/components/auth/resident/resident-register-form";
import { ResidentAuthProvider } from "@/contexts/resident-auth-context";

export const dynamic = "force-dynamic";

export default function ResidentRegisterPage() {
  return (
    <ResidentAuthProvider>
      <ResidentRegisterForm />
    </ResidentAuthProvider>
  );
}
