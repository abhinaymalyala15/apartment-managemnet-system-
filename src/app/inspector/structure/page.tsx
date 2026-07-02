import { redirect } from "next/navigation";
import { routes } from "@/config/routes";

export default function AdminStructureRedirect() {
  redirect(routes.dashboard.inspector.settings.profile);
}
