import { redirect } from "next/navigation";
import { routes } from "@/config/routes";

export default function AdminBillingSpecialRedirect() {
  redirect(routes.dashboard.admin.billing.flats);
}
