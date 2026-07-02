import { redirect } from "next/navigation";
import { routes } from "@/config/routes";

export default function FinanceReceiptsRedirect() {
  redirect(routes.dashboard.inspector.maintenance.receipts);
}
