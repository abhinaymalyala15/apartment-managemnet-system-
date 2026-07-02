import { redirect } from "next/navigation";
import { routes } from "@/config/routes";

export default function FinanceStatementsRedirect() {
  redirect(routes.dashboard.inspector.maintenance.statements);
}
