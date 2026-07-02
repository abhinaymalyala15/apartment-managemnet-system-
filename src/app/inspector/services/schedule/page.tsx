import { redirect } from "next/navigation";
import { routes } from "@/config/routes";

export default function ServicesSchedulePage() {
  redirect(routes.dashboard.inspector.services.root);
}
