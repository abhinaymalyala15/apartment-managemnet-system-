import { redirect } from "next/navigation";
import { routes } from "@/config/routes";

interface BlockFinanceRedirectProps {
  params: Promise<{ blockId: string }>;
}

export default async function BlockFinanceRedirect({
  params,
}: BlockFinanceRedirectProps) {
  const { blockId } = await params;
  redirect(
    `${routes.dashboard.inspector.maintenance.outstanding}?block=${blockId}`
  );
}
