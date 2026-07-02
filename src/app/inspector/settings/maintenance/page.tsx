import { redirect } from "next/navigation";
import { routes } from "@/config/routes";

export default function SettingsMaintenancePage() {
  redirect(routes.dashboard.inspector.settings.profile);
}
