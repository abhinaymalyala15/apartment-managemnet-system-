import { redirect } from "next/navigation";
import { routes } from "@/config/routes";

export default function AdminServicesAssetsRedirectPage() {
  redirect(routes.dashboard.admin.services.root);
}
