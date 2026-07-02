import { redirect } from "next/navigation";
import { routes } from "@/config/routes";

export default function FinanceOutstandingRedirect() {
  redirect(routes.dashboard.inspector.maintenance.outstanding);
}
