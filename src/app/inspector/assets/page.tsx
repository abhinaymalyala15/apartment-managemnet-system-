import { redirect } from "next/navigation";
import { routes } from "@/config/routes";

export default function AssetsRedirectPage() {
  redirect(routes.dashboard.inspector.services.schedule);
}
