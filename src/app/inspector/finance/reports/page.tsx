import { redirect } from "next/navigation";
import { routes } from "@/config/routes";

export default function FinanceReportsRedirect() {
  redirect(routes.dashboard.inspector.reports.financial);
}
