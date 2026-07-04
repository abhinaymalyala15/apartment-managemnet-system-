import { redirect } from "next/navigation";
import { routes } from "@/config/routes";

export default function AdminBillingPenaltyRedirect() {
  redirect(routes.dashboard.admin.billing.rules);
}
