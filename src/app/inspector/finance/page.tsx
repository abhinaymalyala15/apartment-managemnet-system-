import { redirect } from "next/navigation";
import { routes } from "@/config/routes";

export default function FinanceRedirectPage() {
  redirect(routes.dashboard.inspector.maintenance.outstanding);
}
