import { redirect } from "next/navigation";
import { routes } from "@/config/routes";

export default function AdminServicesFrequencyRedirectPage() {
  redirect(routes.dashboard.admin.services.root);
}
