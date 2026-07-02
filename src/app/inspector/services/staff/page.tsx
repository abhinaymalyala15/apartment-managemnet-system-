import { redirect } from "next/navigation";
import { routes } from "@/config/routes";

export default function ServicesStaffPage() {
  redirect(routes.dashboard.inspector.services.root);
}
