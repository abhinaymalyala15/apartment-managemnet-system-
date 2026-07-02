import { redirect } from "next/navigation";
import { routes } from "@/config/routes";

export default function ServicesAssetsPage() {
  redirect(routes.dashboard.inspector.services.root);
}
