import { redirect } from "next/navigation";
import { routes } from "@/config/routes";

export default function AdminServicesAmcRedirectPage() {
  redirect(routes.dashboard.admin.services.root);
}
