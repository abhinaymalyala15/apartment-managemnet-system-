import { redirect } from "next/navigation";
import { routes } from "@/config/routes";

export default function SettingsStructurePage() {
  redirect(routes.dashboard.inspector.settings.profile);
}
