import { redirect } from "next/navigation";
import { routes } from "@/config/routes";

export default function AdminServicesIndexPage() {
  redirect(routes.dashboard.admin.services.assets);
}
