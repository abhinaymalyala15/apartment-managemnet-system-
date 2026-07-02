import { redirect } from "next/navigation";
import { routes } from "@/config/routes";

export default function MaintenanceIndexPage() {
  redirect(routes.dashboard.inspector.maintenance.outstanding);
}
