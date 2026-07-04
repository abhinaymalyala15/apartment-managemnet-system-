import { redirect } from "next/navigation";
import { routes } from "@/config/routes";

export default function AdminBillingMaintenanceRedirect() {
  redirect(routes.dashboard.admin.billing.flats);
}
