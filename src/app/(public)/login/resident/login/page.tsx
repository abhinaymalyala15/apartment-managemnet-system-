import { ResidentLoginForm } from "@/components/auth/resident/resident-login-form";
import { ResidentAuthProvider } from "@/contexts/resident-auth-context";

export const dynamic = "force-dynamic";

export default async function ResidentLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string }>;
}) {
  const params = await searchParams;

  return (
    <ResidentAuthProvider>
      <ResidentLoginForm registered={params.registered === "1"} />
    </ResidentAuthProvider>
  );
}
