import { ResidentRegisterForm } from "@/components/auth/resident/resident-register-form";
import { ResidentAuthProvider } from "@/contexts/resident-auth-context";

export default function ResidentRegisterPage() {
  return (
    <ResidentAuthProvider>
      <ResidentRegisterForm />
    </ResidentAuthProvider>
  );
}
