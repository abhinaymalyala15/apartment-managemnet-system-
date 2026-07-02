import { redirect } from "next/navigation";
import { routes } from "@/config/routes";

export default function AdminBillingIndexPage() {
  redirect(routes.dashboard.admin.billing.maintenance);
}
