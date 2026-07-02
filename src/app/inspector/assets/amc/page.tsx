import { redirect } from "next/navigation";
import { routes } from "@/config/routes";

export default function AssetsAmcRedirect() {
  redirect(routes.dashboard.inspector.services.assets);
}
