import { redirect } from "next/navigation";
import { routes } from "@/config/routes";

export default function AssetsServicesRedirect() {
  redirect(routes.dashboard.inspector.services.schedule);
}
