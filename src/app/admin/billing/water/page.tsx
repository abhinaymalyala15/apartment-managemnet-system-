import { redirect } from "next/navigation";
import { routes } from "@/config/routes";

export default function AdminBillingWaterRedirect() {
  redirect(routes.dashboard.admin.billing.flats);
}
