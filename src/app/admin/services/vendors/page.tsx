import { redirect } from "next/navigation";
import { routes } from "@/config/routes";

export default function AdminServicesVendorsRedirectPage() {
  redirect(routes.dashboard.admin.services.root);
}
